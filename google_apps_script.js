// Google Apps Script code for handling data from the web app
// Deploy this as a web app with "Execute as: Me" and "Who has access: Anyone"

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doPost(e) {
  // Handle preflight OPTIONS request
  if (e.parameter.method === 'OPTIONS') {
    return doOptions(e);
  }

  try {
    const request = JSON.parse(e.postData.contents);
    const spreadsheetId = '1n7_CAMpzRU6iWfFYD8TJGhWHTmWBtsA7jAFJb5lrC2o'; // Updated spreadsheet ID
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    if (request.action === 'addScore') {
      const scoreData = request.data;
      const sheet = getSheetByGid(spreadsheet, '1979670148'); // Score sheet gid
      sheet.appendRow([
        new Date(), // Generate current timestamp
        scoreData['Student ID'],
        scoreData.Category,
        scoreData['Item Name'],
        scoreData.Ayat || '',
        scoreData.Score,
        scoreData.Date,
        scoreData.Notes || ''
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Score added successfully' }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

// Function to get data from sheets
function doGet(e) {
  // Handle preflight OPTIONS request
  if (e.parameter.method === 'OPTIONS') {
    return doOptions(e);
  }

  try {
    const spreadsheetId = '1n7_CAMpzRU6iWfFYD8TJGhWHTmWBtsA7jAFJb5lrC2o'; // Updated spreadsheet ID
    const params = e.parameter;
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet;

    if (params.sheet === 'Student') {
      sheet = getSheetByGid(spreadsheet, '519414556');
    } else if (params.sheet === 'Teacher') {
      sheet = getSheetByGid(spreadsheet, '1198666405');
    } else if (params.sheet === 'Principal') {
      sheet = getSheetByGid(spreadsheet, '128346155');
    } else if (params.sheet === 'score') {
      sheet = spreadsheet.getActiveSheet(); // gid=0
    } else {
      throw new Error('Invalid sheet name');
    }

    if (!sheet) {
      throw new Error('Sheet not found');
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

// Helper function to get sheet by GID
function getSheetByGid(spreadsheet, gid) {
  const sheets = spreadsheet.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId().toString() === gid) {
      return sheets[i];
    }
  }
  return null;
}