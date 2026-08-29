/// <reference types="google-apps-script" />

function buildRecordedAt(readingDate: string, readingTime: string): Date | string {
  if (!readingDate) {
    return "";
  }

  const [year, month, day] = readingDate.split("-").map(Number);
  const [hour = 0, minute = 0] = (readingTime || "00:00").split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute);
}

function escapeFormulaText(value: string): string {
  return value.replace(/"/g, '""');
}

export function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    // 1. Parse incoming JSON payload from external front-end
    const data = JSON.parse(e.postData.contents);
    const odometerReading = data.odometer;
    const recordedAt = buildRecordedAt(data.readingDate, data.readingTime);
    const submittedAt = new Date();
    const base64Image = data.image; // e.g. "data:image/jpeg;base64,/9j/4AA..."
    const fileName = data.fileName || "odometer_" + new Date().getTime() + ".jpg";

    // 2. Decode base64 and save image to Google Drive
    let fileUrl = "";
    let fileLink = "";
    if (base64Image) {
      const splitBase = base64Image.split(",");
      const contentType = splitBase[0].match(/:(.*?);/)?.[1];
      if (!contentType) {
        throw new Error("Invalid image data");
      }

      const byteData = Utilities.base64Decode(splitBase[1]);
      const blob = Utilities.newBlob(byteData, contentType, fileName);
      
      // Save to "Odometer Records" folder in Google Drive
      const folder = DriveApp.getFolderById("1qzr41bA3J67H4DSjSYDL_Vht_4FSf5wx");
      const file = folder.createFile(blob);
      fileUrl = file.getUrl();
      fileLink = `=HYPERLINK("${escapeFormulaText(fileUrl)}","${escapeFormulaText(fileName)}")`;
    }

    // 3. Append metadata & image link to Google Sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("Odometer Readings");

    if (!sheet) {
      throw new Error('Sheet "Odometer Readings" not found');
    }

    sheet.appendRow([submittedAt, recordedAt, odometerReading, fileLink]);

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