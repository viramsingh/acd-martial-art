/**
 * ACD MARTIAL ARTS - GOOGLE APPS SCRIPT DATABASE SYNC ENGINE
 * =========================================================
 * Copy and paste this script into your Google Sheet's Apps Script editor:
 * Extensions -> Apps Script -> Paste this code -> Deploy -> Web App.
 *
 * SETTINGS ON DEPLOYMENT:
 * - Execute as: Me
 * - Who has access: Anyone
 */

function doGet(e) {
  try {
    var data = getAllSheetsData();
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var payload = requestData.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'GET_ALL_DATA' || action === 'READ_ALL') {
      var allData = getAllSheetsData();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: allData
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // STUDENTS ACTIONS
    // -------------------------------------------------------------
    if (action === 'ADD_STUDENT' || action === 'UPDATE_STUDENT') {
      var sheet = getOrCreateSheet(ss, 'Students', [
        'ID', 'Full Name', 'DOB', 'Gender', 'Phone', 'Email', 'Address',
        'Guardian Name', 'Emergency Phone', 'School Name', 'Batch', 'Belt Level', 'Joining Date', 'Status'
      ]);
      var row = [
        payload.id || '',
        payload.fullName || '',
        payload.dob || '',
        payload.gender || '',
        payload.phone || '',
        payload.email || '',
        payload.address || '',
        payload.guardianName || '',
        payload.emergencyPhone || '',
        payload.schoolName || '',
        payload.batch || '',
        payload.beltLevel || '',
        payload.joiningDate || '',
        payload.status || 'ACTIVE'
      ];
      upsertRowById(sheet, 1, payload.id, row);
    } 
    else if (action === 'DELETE_STUDENT') {
      var studentId = payload.studentId || payload.id;
      var sheet = ss.getSheetByName('Students');
      if (sheet) {
        deleteRowById(sheet, 1, studentId);
      }
    }
    else if (action === 'UPDATE_BELT') {
      var sheet = ss.getSheetByName('Students');
      if (sheet) {
        updateCellById(sheet, 1, payload.studentId, 12, payload.newBelt);
      }
    }

    // -------------------------------------------------------------
    // REGISTRATIONS ACTIONS
    // -------------------------------------------------------------
    else if (action === 'SUBMIT_REGISTRATION' || action === 'APPROVE_REGISTRATION') {
      var sheet = getOrCreateSheet(ss, 'Registrations', [
        'ID', 'Full Name', 'DOB', 'Gender', 'Phone', 'Email', 'Address',
        'Guardian Name', 'Emergency Phone', 'School Name', 'Batch', 'Belt Level', 'Experience', 'Status', 'Submitted At'
      ]);
      var row = [
        payload.id || '',
        payload.fullName || '',
        payload.dob || '',
        payload.gender || '',
        payload.phone || '',
        payload.email || '',
        payload.address || '',
        payload.guardianName || '',
        payload.emergencyPhone || '',
        payload.schoolName || '',
        payload.batch || '',
        payload.beltLevel || '',
        payload.experience || '',
        payload.status || 'PENDING',
        payload.submittedAt || new Date().toLocaleString()
      ];
      upsertRowById(sheet, 1, payload.id, row);
    }
    else if (action === 'DELETE_REGISTRATION') {
      var regId = payload.id || payload.registrationId;
      var sheet = ss.getSheetByName('Registrations');
      if (sheet) {
        deleteRowById(sheet, 1, regId);
      }
    }

    // -------------------------------------------------------------
    // ATTENDANCE ACTIONS
    // -------------------------------------------------------------
    else if (action === 'MARK_ATTENDANCE') {
      var sheet = getOrCreateSheet(ss, 'Attendance', [
        'ID', 'Date', 'Student ID', 'Student Name', 'Batch', 'Status', 'Check-In Time'
      ]);
      var date = payload.date;
      var updates = payload.updates || [];
      for (var i = 0; i < updates.length; i++) {
        var u = updates[i];
        var attId = 'ATT-' + date + '-' + u.studentId;
        var row = [
          attId,
          date,
          u.studentId,
          u.studentName || '',
          u.batch || '',
          u.status || 'ABSENT',
          u.checkInTime || (u.status === 'PRESENT' ? new Date().toLocaleTimeString() : '')
        ];
        upsertRowById(sheet, 1, attId, row);
      }
    }

    // -------------------------------------------------------------
    // ACHIEVEMENTS ACTIONS
    // -------------------------------------------------------------
    else if (action === 'ADD_ACHIEVEMENT' || action === 'UPDATE_ACHIEVEMENT') {
      var sheet = getOrCreateSheet(ss, 'Achievements', [
        'ID', 'Title', 'Student Name', 'Event', 'Position', 'Date', 'Image URL', 'Description'
      ]);
      var row = [
        payload.id || '',
        payload.title || '',
        payload.studentName || '',
        payload.event || '',
        payload.position || '',
        payload.date || '',
        payload.imageUrl || '',
        payload.description || ''
      ];
      upsertRowById(sheet, 1, payload.id, row);
    }
    else if (action === 'DELETE_ACHIEVEMENT') {
      var achId = payload.id || payload.achievementId;
      var sheet = ss.getSheetByName('Achievements');
      if (sheet) {
        deleteRowById(sheet, 1, achId);
      }
    }

    // -------------------------------------------------------------
    // EVENTS ACTIONS
    // -------------------------------------------------------------
    else if (action === 'ADD_EVENT' || action === 'UPDATE_EVENT') {
      var sheet = getOrCreateSheet(ss, 'Events', [
        'ID', 'Title', 'Category', 'Date', 'Time', 'Location', 'Description', 'Image', 'Badge Color'
      ]);
      var row = [
        payload.id || '',
        payload.title || '',
        payload.category || '',
        payload.date || '',
        payload.time || '',
        payload.location || '',
        payload.desc || payload.description || '',
        payload.image || '',
        payload.badgeColor || ''
      ];
      upsertRowById(sheet, 1, payload.id, row);
    }
    else if (action === 'DELETE_EVENT') {
      var evtId = payload.id || payload.eventId;
      var sheet = ss.getSheetByName('Events');
      if (sheet) {
        deleteRowById(sheet, 1, evtId);
      }
    }

    // -------------------------------------------------------------
    // CONTACT MESSAGES ACTIONS
    // -------------------------------------------------------------
    else if (action === 'ADD_CONTACT_MESSAGE') {
      var sheet = getOrCreateSheet(ss, 'Messages', [
        'ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Created At'
      ]);
      var row = [
        payload.id || '',
        payload.name || '',
        payload.email || '',
        payload.phone || '',
        payload.subject || '',
        payload.message || '',
        payload.status || 'NEW',
        payload.createdAt || new Date().toLocaleString()
      ];
      upsertRowById(sheet, 1, payload.id, row);
    }
    else if (action === 'DELETE_MESSAGE') {
      var msgId = payload.id || payload.messageId;
      var sheet = ss.getSheetByName('Messages');
      if (sheet) {
        deleteRowById(sheet, 1, msgId);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Action ' + action + ' executed successfully.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------

function getAllSheetsData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    students: getSheetRows(ss, 'Students', ['id', 'fullName', 'dob', 'gender', 'phone', 'email', 'address', 'guardianName', 'emergencyPhone', 'schoolName', 'batch', 'beltLevel', 'joiningDate', 'status']),
    registrations: getSheetRows(ss, 'Registrations', ['id', 'fullName', 'dob', 'gender', 'phone', 'email', 'address', 'guardianName', 'emergencyPhone', 'schoolName', 'batch', 'beltLevel', 'experience', 'status', 'submittedAt']),
    attendance: getSheetRows(ss, 'Attendance', ['id', 'date', 'studentId', 'studentName', 'batch', 'status', 'checkInTime']),
    achievements: getSheetRows(ss, 'Achievements', ['id', 'title', 'studentName', 'event', 'position', 'date', 'imageUrl', 'description']),
    events: getSheetRows(ss, 'Events', ['id', 'title', 'category', 'date', 'time', 'location', 'desc', 'image', 'badgeColor']),
    messages: getSheetRows(ss, 'Messages', ['id', 'name', 'email', 'phone', 'subject', 'message', 'status', 'createdAt'])
  };
}

function getSheetRows(ss, sheetName, fields) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // header row only

  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue; // Skip empty ID rows
    var obj = {};
    for (var j = 0; j < fields.length; j++) {
      obj[fields[j]] = row[j] !== undefined ? String(row[j]) : '';
    }
    result.push(obj);
  }
  return result;
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
  }
  return sheet;
}

function upsertRowById(sheet, idColIndex, targetId, rowData) {
  if (!targetId) {
    sheet.appendRow(rowData);
    return;
  }
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex - 1]) === String(targetId)) {
      sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      return;
    }
  }
  sheet.appendRow(rowData);
}

function deleteRowById(sheet, idColIndex, targetId) {
  if (!targetId) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex - 1]) === String(targetId)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function updateCellById(sheet, idColIndex, targetId, targetColIndex, newValue) {
  if (!targetId) return;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex - 1]) === String(targetId)) {
      sheet.getRange(i + 1, targetColIndex).setValue(newValue);
      return;
    }
  }
}
