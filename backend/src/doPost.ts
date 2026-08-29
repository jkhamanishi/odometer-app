/// <reference types="google-apps-script" />

export function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    // 1. Parse incoming JSON payload from external front-end
    const data = JSON.parse(e.postData.contents);
    const odometerReading = data.odometer;
    const base64Image = data.image; // e.g. "data:image/jpeg;base64,/9j/4AA..."
    const fileName = data.fileName || "odometer_" + new Date().getTime() + ".jpg";

    // 2. Decode base64 and save image to Google Drive
    let fileUrl = "No image uploaded";
    if (base64Image) {
      const splitBase = base64Image.split(",");
      const contentType = splitBase[0].match(/:(.*?);/)[1];
      const byteData = Utilities.base64Decode(splitBase[1]);
      const blob = Utilities.newBlob(byteData, contentType, fileName);
      
      // Save to root Drive (or replace DriveApp with DriveApp.getFolderById("FOLDER_ID"))
      const file = DriveApp.createFile(blob);
      fileUrl = file.getUrl();
    }

    // 3. Append metadata & image link to Google Sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([new Date(), odometerReading, fileUrl]);

    // 4. Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data recorded successfully",
      fileUrl: fileUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: errorMessage
    })).setMimeType(ContentService.MimeType.JSON);
  }
}