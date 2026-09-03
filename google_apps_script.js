/**
 * ACD Martial Arts - Official Google Apps Script Integration (Code.gs)
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Delete all existing code in Code.gs and replace it completely with this code.
 * 3. Click Save (Disk Icon).
 * 4. Click Deploy -> New deployment.
 * 5. Select Type: "Web app"
 * 6. Set Description: "ACD Martial Arts Integration API v2"
 * 7. Set Execute as: "Me"
 * 8. Set Who has access: "Anyone"  <-- CRITICAL for Vercel/Website connectivity!
 * 9. Click Deploy and copy the Web App URL into your Admin Dashboard Google Sheets tab!
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  autoSetupSheets(ss);
  var data = getAllData(ss);
  return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var payload = data.payload || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    autoSetupSheets(ss);

    // 1. FETCH ALL DATA
    if (action === "GET_ALL_DATA" || action === "READ_ALL") {
      var allData = getAllData(ss);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: allData }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. REGISTRATIONS
    if (action === "SUBMIT_REGISTRATION" || action === "UPDATE_REGISTRATION") {
      var sheet = ss.getSheetByName("Registrations");
      var row = findRowById(sheet, payload.id);
      var values = [
        payload.id, payload.fullName, payload.dob || "", payload.gender || "",
        payload.phone || "", payload.email || "", payload.guardianName || "",
        payload.emergencyPhone || "", payload.schoolName || "",
        payload.batch || "", payload.beltLevel || "", payload.status || "PENDING", payload.submittedAt || new Date().toLocaleString()
      ];
      if (row > 0) {
        sheet.getRange(row, 1, 1, values.length).setValues([values]);
      } else {
        sheet.appendRow(values);
      }
    }

    // 3. STUDENTS
    if (action === "ADD_STUDENT" || action === "UPDATE_STUDENT") {
      var sheet = ss.getSheetByName("Students");
      var row = findRowById(sheet, payload.id);
      var values = [
        payload.id, payload.fullName, payload.dob || "", payload.gender || "",
        payload.phone || "", payload.email || "", payload.address || "",
        payload.guardianName || "", payload.emergencyPhone || "",
        payload.schoolName || "", payload.batch || "", payload.beltLevel || "",
        payload.status || "ACTIVE", payload.joiningDate || new Date().toISOString().split('T')[0]
      ];
      if (row > 0) {
        sheet.getRange(row, 1, 1, values.length).setValues([values]);
      } else {
        sheet.appendRow(values);
      }
    }

    if (action === "UPDATE_BELT") {
      var sheet = ss.getSheetByName("Students");
      var row = findRowById(sheet, payload.studentId);
      if (row > 0) {
        sheet.getRange(row, 12).setValue(payload.newBelt);
      }
    }

    if (action === "DELETE_STUDENT") {
      var sheet = ss.getSheetByName("Students");
      deleteRowById(sheet, payload.studentId);
    }


    // 4. ATTENDANCE
    if (action === "MARK_ATTENDANCE") {
      var sheet = ss.getSheetByName("Attendance");
      var date = formatDateString(payload.date, ss);
      var updates = payload.updates || [];
      if (sheet && updates.length > 0) {
        var data = sheet.getDataRange().getValues();
        var displayData = sheet.getDataRange().getDisplayValues();

        for (var i = 0; i < updates.length; i++) {
          var u = updates[i];
          var targetStudentId = String(u.studentId || '').trim();
          var targetBatch = String(u.batch || '').trim();
          var foundRow = -1;

          for (var r = 1; r < data.length; r++) {
            var rowDate = formatDateString(data[r][1], ss);
            if (!rowDate && displayData[r] && displayData[r][1]) {
              rowDate = formatDateString(displayData[r][1], ss);
            }
            var rowStudentId = String(data[r][2] || '').trim();
            var rowBatch = String(data[r][4] || '').trim();

            if (rowDate === date && rowStudentId === targetStudentId && rowBatch === targetBatch) {
              foundRow = r + 1; // 1-indexed row in sheet
              break;
            }
          }

          if (foundRow > 0) {
            sheet.getRange(foundRow, 6).setValue(u.status); // Col 6: Status
          } else {
            sheet.appendRow([
              "ATT-" + Date.now() + "-" + i,
              date,
              u.studentId,
              u.studentName,
              u.batch,
              u.status,
              "",
              ""
            ]);
          }
        }
      }
    }

    // 5. ACHIEVEMENTS
    if (action === "ADD_ACHIEVEMENT" || action === "UPDATE_ACHIEVEMENT") {
      var sheet = ss.getSheetByName("Achievements");
      var row = findRowById(sheet, payload.id);
      var values = [
        payload.id, payload.title, payload.studentName, payload.event || "",
        payload.position || "", payload.date || "", payload.description || "", payload.imageUrl || ""
      ];
      if (row > 0) {
        sheet.getRange(row, 1, 1, values.length).setValues([values]);
      } else {
        sheet.appendRow(values);
      }
    }

    if (action === "DELETE_ACHIEVEMENT") {
      var sheet = ss.getSheetByName("Achievements");
      deleteRowById(sheet, payload.id);
    }

    // 6. EVENTS
    if (action === "ADD_EVENT" || action === "UPDATE_EVENT") {
      var sheet = ss.getSheetByName("Events");
      var row = findRowById(sheet, payload.id);
      var values = [
        payload.id, payload.title, payload.category || "", payload.date || "",
        payload.time || "", payload.location || "", payload.desc || "", payload.badgeColor || ""
      ];
      if (row > 0) {
        sheet.getRange(row, 1, 1, values.length).setValues([values]);
      } else {
        sheet.appendRow(values);
      }
    }

    if (action === "DELETE_EVENT") {
      var sheet = ss.getSheetByName("Events");
      deleteRowById(sheet, payload.id);
    }

    // 7. MESSAGES
    if (action === "ADD_MESSAGE") {
      var sheet = ss.getSheetByName("Messages");
      sheet.appendRow([
        payload.id, payload.name, payload.email || "", payload.phone || "",
        payload.subject || "", payload.message || "", payload.status || "NEW", payload.createdAt || new Date().toLocaleString()
      ]);
    }

    if (action === "DELETE_MESSAGE") {
      var sheet = ss.getSheetByName("Messages");
      deleteRowById(sheet, payload.id);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Action processed successfully" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------

function formatDateString(val, ss) {
  if (!val) return '';
  var str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  if (val instanceof Date || (typeof val === 'object' && val.getFullYear)) {
    try {
      var tz = ss ? ss.getSpreadsheetTimeZone() : Session.getScriptTimeZone();
      return Utilities.formatDate(val, tz, "yyyy-MM-dd");
    } catch (e) {
      var y = val.getFullYear();
      var m = ('0' + (val.getMonth() + 1)).slice(-2);
      var d = ('0' + val.getDate()).slice(-2);
      return y + '-' + m + '-' + d;
    }
  }
  try {
    var parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      var tz = ss ? ss.getSpreadsheetTimeZone() : Session.getScriptTimeZone();
      return Utilities.formatDate(parsed, tz, "yyyy-MM-dd");
    }
  } catch (e) {}
  return str.substring(0, 10);
}

function deleteRowById(sheet, id) {
  if (!sheet || !id) return;
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
    }
  }
}

function findRowById(sheet, id) {
  if (!sheet || !id) return -1;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      return i + 1;
    }
  }
  return -1;
}

function getAllData(ss) {
  return {
    students: getSheetObjects(ss.getSheetByName("Students"), ["id", "fullName", "dob", "gender", "phone", "email", "address", "guardianName", "emergencyPhone", "schoolName", "batch", "beltLevel", "status", "joiningDate"]),
    attendance: getSheetObjects(ss.getSheetByName("Attendance"), ["id", "date", "studentId", "studentName", "batch", "status", "checkInTime", "remarks"]),
    achievements: getSheetObjects(ss.getSheetByName("Achievements"), ["id", "title", "studentName", "event", "position", "date", "description", "imageUrl"]),
    events: getSheetObjects(ss.getSheetByName("Events"), ["id", "title", "category", "date", "time", "location", "desc", "badgeColor"]),
    messages: getSheetObjects(ss.getSheetByName("Messages"), ["id", "name", "email", "phone", "subject", "message", "status", "createdAt"]),
    registrations: getSheetObjects(ss.getSheetByName("Registrations"), ["id", "fullName", "dob", "gender", "phone", "email", "guardianName", "emergencyPhone", "schoolName", "batch", "beltLevel", "status", "submittedAt"])
  };
}

function getSheetObjects(sheet, keys) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var k = 0; k < keys.length; k++) {
      obj[keys[k]] = row[k] !== undefined ? row[k].toString() : "";
    }
    if (obj.id) {
      result.push(obj);
    }
  }
  return result;
}

function autoSetupSheets(ss) {
  var sheets = [
    { name: "Students", headers: ["ID", "Full Name", "DOB", "Gender", "Phone", "Email", "Address", "Guardian Name", "Emergency Phone", "School Name", "Batch", "Belt Level", "Status", "Joining Date"] },
    { name: "Attendance", headers: ["ID", "Date", "Student ID", "Student Name", "Batch", "Status", "CheckIn Time", "Remarks"] },
    { name: "Achievements", headers: ["ID", "Title", "Student Name", "Event", "Position", "Date", "Description", "Image URL"] },
    { name: "Events", headers: ["ID", "Title", "Category", "Date", "Time", "Location", "Description", "Badge Color"] },
    { name: "Messages", headers: ["ID", "Name", "Email", "Phone", "Subject", "Message", "Status", "Created At"] },
    { name: "Registrations", headers: ["ID", "Full Name", "DOB", "Gender", "Phone", "Email", "Guardian Name", "Emergency Phone", "School Name", "Batch", "Belt Level", "Status", "Submitted At"] }
  ];

  for (var s = 0; s < sheets.length; s++) {
    var target = ss.getSheetByName(sheets[s].name);
    if (!target) {
      target = ss.insertSheet(sheets[s].name);
      target.appendRow(sheets[s].headers);
      target.getRange(1, 1, 1, sheets[s].headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    }
  }
}
