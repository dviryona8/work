const SHEET_ID = '1SuN7trkDHTQaQYeRAUPUaftG-2DlIduYEtdRhchKWi4';

// מחזיר את הטאב המתאים לסניף — יוצר אוטומטית אם לא קיים
function getTeamSheet(team) {
  const safeName = (team || 'default').replace(/[^a-zA-Z0-9א-ת\-_]/g, '').slice(0, 40);
  const tabName  = 'submissions_' + safeName;
  const ss       = SpreadsheetApp.openById(SHEET_ID);
  let sheet      = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(['תאריך שליחה', 'שם', 'הודעה', 'שבוע', 'הערות']);
  }
  return sheet;
}

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || '';
  const team   = (e.parameter && e.parameter.team)   || 'default';

  // ── הגשת עובד ──
  if (action === 'submit') {
    try {
      getTeamSheet(team).appendRow([
        new Date(),
        e.parameter.name    || '',
        e.parameter.message || '',
        e.parameter.week    || '',
        e.parameter.notes   || ''
      ]);
      return respond({ ok: true, team });
    } catch(err) {
      return respond({ ok: false, error: err.message });
    }
  }

  // ── ניקוי שבוע ──
  if (action === 'clear') {
    try {
      const sheet = getTeamSheet(team);
      const last  = sheet.getLastRow();
      if (last > 1) sheet.deleteRows(2, last - 1);
      return respond({ ok: true, cleared: true, team });
    } catch(err) {
      return respond({ ok: false, error: err.message });
    }
  }

  // ── מידע ──
  return respond({ ok: true, status: 'ready', sheetId: SHEET_ID });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    getTeamSheet(data.team || 'default').appendRow([
      new Date(), data.name||'', data.message||'', data.week||'', data.notes||''
    ]);
    return respond({ ok: true });
  } catch(err) {
    return respond({ ok: false, error: err.message });
  }
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
