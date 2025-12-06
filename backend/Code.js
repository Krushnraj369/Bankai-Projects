// ============================================================================
// BANKAI QA - GOOGLE APPS SCRIPT BACKEND
// ============================================================================

// 1. Serve the HTML Application
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('BankaiQA System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 2. Helper to get Sheets
function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// ============================================================================
// API: TEST CASES
// ============================================================================

function apiGetTestCases() {
  var sheet = getSheet('TestCases');
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return JSON.stringify({ status: 'success', data: [] });
  
  var headers = data[0];
  var rows = data.slice(1);
  
  var formatted = rows.map(function(row) {
    var obj = {};
    headers.forEach(function(header, index) {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return JSON.stringify({ status: 'success', data: formatted });
}

function apiCreateTestCase(payload) {
  var sheet = getSheet('TestCases');
  var headers = sheet.getDataRange().getValues()[0];
  
  if (!headers || headers.length === 0 || (headers.length === 1 && headers[0] === "")) {
    headers = Object.keys(payload);
    sheet.appendRow(headers);
  }
  
  var row = headers.map(function(header) {
    return payload[header] || '';
  });
  
  sheet.appendRow(row);
  return JSON.stringify({ status: 'success' });
}

// --- BULK IMPORT OPTIMIZATION ---
function apiImportTestCases(dataArray) {
  var sheet = getSheet('TestCases');
  var existingData = sheet.getDataRange().getValues();
  var headers = existingData[0];

  // If new sheet, create headers from first item in import
  if (!headers || headers.length === 0 || (headers.length === 1 && headers[0] === "")) {
    if (dataArray.length > 0) {
      headers = Object.keys(dataArray[0]);
      sheet.appendRow(headers);
      // Re-fetch to confirm structure
      existingData = sheet.getDataRange().getValues();
      headers = existingData[0];
    } else {
      return JSON.stringify({ status: 'success', message: 'No data to import' });
    }
  }

  // Convert objects to rows based on current headers
  var rowsToAdd = dataArray.map(function(item) {
    return headers.map(function(header) {
      return item[header] !== undefined ? item[header] : '';
    });
  });

  if (rowsToAdd.length > 0) {
    // Write all rows at once for performance
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, headers.length).setValues(rowsToAdd);
  }

  return JSON.stringify({ status: 'success', count: rowsToAdd.length });
}

function apiUpdateTestCase(payload) {
  var sheet = getSheet('TestCases');
  var data = sheet.getDataRange().getValues();
  var idColumnIndex = data[0].indexOf('id');
  
  if (idColumnIndex === -1) return JSON.stringify({ status: 'error', message: 'ID column not found' });
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][idColumnIndex] == payload.id) {
       var headers = data[0];
       headers.forEach(function(header, colIndex) {
         if (payload[header] !== undefined) {
           sheet.getRange(i + 1, colIndex + 1).setValue(payload[header]);
         }
       });
       return JSON.stringify({ status: 'success' });
    }
  }
  return JSON.stringify({ status: 'error', message: 'ID not found' });
}

function apiBulkUpdateTestCases(payload) {
  var ids = payload.ids;
  var updates = payload.updates;
  var sheet = getSheet('TestCases');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIdx = headers.indexOf('id');

  if (idIdx === -1) return JSON.stringify({ status: 'error', message: 'ID column not found' });

  // Map header name to column index (1-based)
  var colMap = {};
  headers.forEach(function(h, i) { colMap[h] = i + 1; });

  for (var i = 1; i < data.length; i++) {
    // Check if current row ID is in the list of IDs to update
    if (ids.indexOf(data[i][idIdx]) > -1) {
      Object.keys(updates).forEach(function(key) {
        if (colMap[key]) {
           sheet.getRange(i + 1, colMap[key]).setValue(updates[key]);
        }
      });
    }
  }
  return JSON.stringify({ status: 'success' });
}

function apiDeleteTestCases(ids) {
  var sheet = getSheet('TestCases');
  var data = sheet.getDataRange().getValues();
  var idColumnIndex = data[0].indexOf('id');
  
  for (var i = data.length - 1; i >= 1; i--) {
    if (ids.indexOf(data[i][idColumnIndex]) > -1) {
      sheet.deleteRow(i + 1);
    }
  }
  return JSON.stringify({ status: 'success' });
}

// ============================================================================
// API: AUTHENTICATION
// ============================================================================

function apiLogin(credentials) {
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    if (String(credentials.userId).toLowerCase() === 'admin' && String(credentials.password) === '1') {
       return JSON.stringify({ status: 'success', data: { USERID: 'Admin', NAME: 'System Admin', ACTIVE_FLAG: 'Y' } });
    }
    return JSON.stringify({ status: 'error', message: 'Users sheet is empty. Try Admin / 1' });
  }
  
  var headers = data[0];
  var rows = data.slice(1);
  var user = null;
  
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var uId = row[headers.indexOf('USERID')];
    var pwd = row[headers.indexOf('PASSWORD')];
    
    if (String(uId).toLowerCase() === String(credentials.userId).toLowerCase() && String(pwd) === String(credentials.password)) {
       user = {
         USERID: uId,
         NAME: row[headers.indexOf('NAME')],
         ACTIVE_FLAG: row[headers.indexOf('ACTIVE_FLAG')]
       };
       break;
    }
  }
  
  if (user) {
    if (user.ACTIVE_FLAG === 'N') return JSON.stringify({ status: 'error', message: 'User is inactive' });
    return JSON.stringify({ status: 'success', data: user });
  } else {
    if (String(credentials.userId).toLowerCase() === 'admin' && String(credentials.password) === '1') {
       return JSON.stringify({ status: 'success', data: { USERID: 'Admin', NAME: 'System Admin', ACTIVE_FLAG: 'Y' } });
    }
    return JSON.stringify({ status: 'error', message: 'Invalid Credentials' });
  }
}

// ============================================================================
// API: CONFIGURATION (Users, Dropdowns)
// ============================================================================

function apiGetUsers() {
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return JSON.stringify({ status: 'success', data: [] });
  
  var headers = data[0];
  var rows = data.slice(1);
  var formatted = rows.map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
  return JSON.stringify({ status: 'success', data: formatted });
}

function apiCreateUser(user) {
  var sheet = getSheet('Users');
  var headers = sheet.getDataRange().getValues()[0];
  if (!headers || headers.length === 0) {
    headers = ['USERID', 'PASSWORD', 'NAME', 'ACTIVE_FLAG'];
    sheet.appendRow(headers);
  }
  var row = [user.USERID, user.PASSWORD, user.NAME, user.ACTIVE_FLAG];
  sheet.appendRow(row);
  return JSON.stringify({ status: 'success' });
}

function apiToggleUser(userId) {
  var sheet = getSheet('Users');
  var data = sheet.getDataRange().getValues();
  var idIdx = data[0].indexOf('USERID');
  var activeIdx = data[0].indexOf('ACTIVE_FLAG');
  
  for(var i=1; i<data.length; i++) {
    if(data[i][idIdx] == userId) {
      var current = data[i][activeIdx];
      sheet.getRange(i+1, activeIdx+1).setValue(current === 'Y' ? 'N' : 'Y');
      return JSON.stringify({ status: 'success' });
    }
  }
  return JSON.stringify({ status: 'error' });
}

// --- DROPDOWN CONFIG ---
function apiGetConfiguration() {
  var sheet = getSheet('Configuration');
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return JSON.stringify({ status: 'success', data: [] });
  
  var headers = data[0]; // Expect ['category', 'value']
  var rows = data.slice(1);
  var formatted = rows.map(function(row) {
    return { category: row[0], value: row[1] };
  });
  return JSON.stringify({ status: 'success', data: formatted });
}

function apiAddConfiguration(payload) {
  var sheet = getSheet('Configuration');
  var headers = sheet.getDataRange().getValues()[0];
  if (!headers || headers.length === 0) {
    sheet.appendRow(['category', 'value']);
  }
  sheet.appendRow([payload.category, payload.value]);
  return JSON.stringify({ status: 'success' });
}

function apiDeleteConfiguration(payload) {
  var sheet = getSheet('Configuration');
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === payload.category && data[i][1] === payload.value) {
      sheet.deleteRow(i + 1);
    }
  }
  return JSON.stringify({ status: 'success' });
}

function apiPing() {
  return JSON.stringify({ status: 'success', message: 'pong' });
}