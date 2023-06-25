import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

export const CREDENTIALS_FILE_PATH = "credentials.json";
export const SPREADSHEET_ID = "1hozq7j8Vs3E5wKqhY3tUULpKvA4XoHW-Du2RtkuWYmw";
export const RANGE = "Guest List!A:P";

export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  const [headerRow, ...dataRows] = rows;
  return dataRows.map((row) => {
    const rowObject: Record<string, string> = {};
    headerRow.forEach((header, index) => {
      rowObject[header] = row[index];
    });
    return rowObject;
  });
}

export function getSheetAuth() {
  const auth = new google.auth.JWT(
    process.env.GCLOUD_CLIENT_EMAIL,
    undefined,
    process.env.GCLOUD_PRIVATE_KEY,
    scopes
  );
  return auth;
}

export async function readGuestList(
  auth: ReturnType<typeof getSheetAuth>
): Promise<Record<string, string>[]> {
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = response.data.values;

  if (!rows) {
    throw new Error("No rows found");
  }

  const objects = rowsToObjects(rows);
  return objects;
}
