// ── CONFIG ──────────────────────────────────────────────────
var SHEET_ID   = "1UR4s4wmbhKz49SNG-PeM9xu_hZPeQ7NwsNqg0w67Jgs";
var SHEET_NAME = "Tasks";

// ── ENTRY POINT ─────────────────────────────────────────────
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Kanban Board")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

// ── HELPERS ──────────────────────────────────────────────────
function getSheet() {
  var ss    = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); setupSheet(sheet); }
  return sheet;
}

// Wraps every write in LockService to prevent concurrency conflicts
function withLock(fn) {
  var l = LockService.getScriptLock();
  if (!l.tryLock(10000)) return { success: false, error: "Server busy, retry." };
  try   { return fn(); }
  catch (e) { return { success: false, error: e.toString() }; }
  finally   { l.releaseLock(); }
}

// ── READ ─────────────────────────────────────────────────────
function getTasks() {
  try {
    var tasks = [], rows = getSheet().getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (r[0]) tasks.push({ id: r[0]+'', title: r[1]+'', description: r[2]+'',
        status: r[3]+'', lastUpdated: r[4]+'', priority: r[5]||'medium', assignee: r[6]||'' });
    }
    return { success: true, tasks: tasks };
  } catch(e) { return { success: false, error: e.toString() }; }
}

// Lightweight poll — returns only the latest timestamp (avoids full data fetch every 4s)
function getLastUpdated() {
  try {
    var rows = getSheet().getDataRange().getValues(), ts = "";
    for (var i = 1; i < rows.length; i++) if ((rows[i][4]+'') > ts) ts = rows[i][4]+'';
    return { success: true, lastUpdated: ts };
  } catch(e) { return { success: false, error: e.toString() }; }
}

// ── WRITE ─────────────────────────────────────────────────────
function updateTaskStatus(id, status, clientTs) {
  return withLock(function() {
    var sheet = getSheet(), rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]+'' !== id+'') continue;
      // Conflict detection: if another user already updated this task, reject
      if (clientTs && rows[i][4]+'' !== clientTs)
        return { success: false, conflict: true, message: "Task changed by another user." };
      var ts = new Date().toISOString();
      sheet.getRange(i+1, 4).setValue(status);
      sheet.getRange(i+1, 5).setValue(ts);
      return { success: true, timestamp: ts };
    }
    return { success: false, error: "Task not found" };
  });
}

function addTask(title, desc, priority, assignee, status) {
  return withLock(function() {
    var id = "TASK-" + Date.now(), ts = new Date().toISOString(), s = status || "Backlog";
    getSheet().appendRow([id, title||"Untitled", desc||"", s, ts, priority||"medium", assignee||""]);
    return { success: true, task: { id:id, title:title||"Untitled", description:desc||"",
      status:s, lastUpdated:ts, priority:priority||"medium", assignee:assignee||"" }};
  });
}

function editTask(id, title, desc, priority, assignee) {
  return withLock(function() {
    var sheet = getSheet(), rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]+'' !== id+'') continue;
      var ts = new Date().toISOString();
      sheet.getRange(i+1, 2, 1, 5).setValues([[title||"", desc||"", ts, priority||"medium", assignee||""]]);
      return { success: true, timestamp: ts };
    }
    return { success: false, error: "Task not found" };
  });
}

function deleteTask(id) {
  return withLock(function() {
    var sheet = getSheet(), rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]+'' === id+'') { sheet.deleteRow(i+1); return { success: true }; }
    }
    return { success: false, error: "Task not found" };
  });
}

// ── ONE-TIME SETUP ────────────────────────────────────────────
function setupSheet(sheet) {
  sheet = sheet || getSheet();
  var h = ["TaskID","Title","Description","Status","LastUpdated","Priority","Assignee"];
  sheet.getRange(1,1,1,h.length).setValues([h]).setFontWeight("bold")
    .setBackground("#4a90d9").setFontColor("#ffffff");
  var now = new Date().toISOString();
  sheet.getRange(2,1,4,h.length).setValues([
    ["TASK-001","Design UI mockups","Create wireframes","Backlog",now,"high","Alice"],
    ["TASK-002","Set up database","Define schema","In-Progress",now,"high","Bob"],
    ["TASK-003","Write unit tests","Cover main functions","Backlog",now,"medium","Charlie"],
    ["TASK-004","Code review PR #42","Review auth module","Done",now,"medium","Alice"]
  ]);
  sheet.autoResizeColumns(1, h.length);
  return "Setup complete!";
}