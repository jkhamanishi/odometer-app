/// <reference types="google-apps-script" />

export function doGet(e: GoogleAppsScript.Events.DoGet) {
  const response = {
    status: "ok",
    app: "Odometer Tracker API",
    message: "Backend is running. Submit odometer readings with POST.",
    request: {
      parameters: e.parameter,
    },
    endpoints: {
      GET: "Health/status information",
      POST: "Submit odometer reading, date/time, and optional image",
    },
    spreadsheet: {
      name: SpreadsheetApp.getActiveSpreadsheet().getName(),
      activeSheet: SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName(),
    },
    timestamp: new Date().toISOString(),
  };

  return ContentService
    .createTextOutput(JSON.stringify(response, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}