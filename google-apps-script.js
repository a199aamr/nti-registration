// ==========================================
// EELU Orientation Day - Google Apps Script
// ==========================================
// Deploy this as a Web App in Google Apps Script
//
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com
// 2. Create a new project
// 3. Paste this code
// 4. Replace SPREADSHEET_ID with your Google Sheet ID
// 5. Deploy → New deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy the Web App URL
// 7. Paste it in src/hooks/useGoogleSheets.js (SCRIPT_URL variable)
// ==========================================

const SPREADSHEET_ID = '17Mjh6y60dek0vvNavuLlG6drPJs9nOanUvZrJ6ewV7c';
const SHEET_NAME = 'Big data regesteration';

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'check') {
    return checkDuplicate(e.parameter.phone);
  }

  if (action === 'register') {
    const data = {
      name: e.parameter.name,
      phone: e.parameter.phone,
    };

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const newSheet = ss.insertSheet(SHEET_NAME);
      newSheet.appendRow(['Timestamp', 'Full Name', 'Phone Number', 'Source']);
      newSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      return addRegistration(newSheet, data);
    }

    return addRegistration(sheet, data);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      // Create sheet with headers if it doesn't exist
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const newSheet = ss.insertSheet(SHEET_NAME);
      newSheet.appendRow(['Timestamp', 'Full Name', 'Phone Number', 'Faculty', 'Source']);
      newSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
      return addRegistration(newSheet, data);
    }

    return addRegistration(sheet, data);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addRegistration(sheet, data) {
  // Use lock to prevent race conditions (two submissions at same time)
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000); // Wait up to 10 seconds for lock

    const normalizedPhone = normalizePhone(data.phone);

    // Validate phone
    if (!normalizedPhone || normalizedPhone.length !== 11) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid phone number'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Check for duplicate phone number
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const phones = sheet.getRange(2, 3, lastRow - 1, 1).getValues();

      for (let i = 0; i < phones.length; i++) {
        if (normalizePhone(phones[i][0].toString()) === normalizedPhone) {
          return ContentService
            .createTextOutput(JSON.stringify({
              success: false,
              duplicate: true,
              message: 'Phone number already registered'
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    const name = (data.name || '').trim();
    if (name.length < 3 || name.length > 60) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid name'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }


    // Add new registration
    const timestamp = new Date().toLocaleString('en-EG', { timeZone: 'Africa/Cairo' });
    const newRow = sheet.getLastRow() + 1;

    // Set phone column as text FIRST, then set value — prevents Sheets from dropping leading 0
    sheet.getRange(newRow, 3).setNumberFormat('@');
    sheet.getRange(newRow, 1, 1, 4).setValues([[
      timestamp,
      name,
      normalizedPhone,
      'Website'
    ]]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        duplicate: false,
        message: 'Registration successful'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function checkDuplicate(phone) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ exists: false }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const phones = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues();
    const normalizedPhone = normalizePhone(phone);

    for (let i = 0; i < phones.length; i++) {
      if (normalizePhone(phones[i][0].toString()) === normalizedPhone) {
        return ContentService
          .createTextOutput(JSON.stringify({ exists: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ exists: false }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ exists: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function normalizePhone(phone) {
  let cleaned = phone.toString().replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  }

  if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  }

  // If Google Sheets dropped leading 0 (stored as number), add it back
  if (/^\d{10}$/.test(cleaned) && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

// Run this function once to set up the spreadsheet
function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Set headers
  const headers = ['Timestamp', 'Full Name', 'Phone Number', 'Faculty', 'Source'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#1e3a8a');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');

  // Set column widths
  sheet.setColumnWidth(1, 180); // Timestamp
  sheet.setColumnWidth(2, 200); // Name
  sheet.setColumnWidth(3, 150); // Phone
  sheet.setColumnWidth(4, 120); // Faculty
  sheet.setColumnWidth(5, 100); // Source

  // Freeze header row
  sheet.setFrozenRows(1);

  Logger.log('Sheet setup complete!');
}
