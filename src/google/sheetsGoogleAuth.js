import { google } from "googleapis";
import util from "util";
import _ from "lodash";
import dayjs from "dayjs";
import { TotoLib } from "../lib/toto";

export class SheetsGoogleAuth {
    SCOPES = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ];

    constructor(serviceAccountCreds) {
        this.googleAuth = new google.auth.GoogleAuth({
            credentials: serviceAccountCreds,
            scopes: this.SCOPES,
        });
        this.initialize();
    }

    async initialize() {
        this.sheets = google.sheets({ version: "v4", auth: this.googleAuth });
        this.drive = google.drive({ version: "v3", auth: this.googleAuth });
    }

    async updateCell({ spreadsheetName, cell, values }) {
        const spreadsheetInfo = await this.getSheet(spreadsheetName);
        return await this.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetInfo.spreadsheetId,
            valueInputOption: "USER_ENTERED",
            range: cell,
            requestBody: {
                values
            }
        });
    }

    async insertTopRow({ spreadsheetName, values }) {
        const spreadsheetInfo = await this.getSheet(spreadsheetName);
        const firstSheet = spreadsheetInfo.sheets[0];
        return await this.sheets.spreadsheets
            .batchUpdate({
                spreadsheetId: spreadsheetInfo.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            insertDimension: {
                                range: {
                                    sheetId: firstSheet.sheetId,
                                    dimension: "ROWS",
                                    startIndex: 0,
                                    endIndex: 1,
                                },
                            },
                        },
                    ],
                },
            })
            .then(async (response) => {
                // insert the values here.
                return await this.sheets.spreadsheets.values.update({
                    spreadsheetId: spreadsheetInfo.spreadsheetId,
                    range: "Sheet1!A1",
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        values: [values],
                    },
                });
            });
    }

    async shareSpreadsheet(spreadsheetName, emailAddress) {
        const sheetInfo = await this.getSheet(spreadsheetName);
        await this.drive.permissions
            .create({
                fileId: sheetInfo.spreadsheetId,
                requestBody: {
                    emailAddress,
                    role: "writer", // Change the role as needed (reader, writer, commenter)
                    type: "user",
                },
            })
            .then((response) => {
                console.log(
                    `Sheet ${spreadsheetName} is shared with ${emailAddress}`
                );
                return response;
            });
    }

    async getSheet(spreadsheetName) {
        return await this.drive.files
            .list({
                q: "mimeType='application/vnd.google-apps.spreadsheet'", // Filter to retrieve only spreadsheets
            })
            .then((response) => {
                const { data } = response;
                for (let info of data.files) {
                    if (info.name === spreadsheetName) {
                        return info;
                    }
                }
                return null;
            })
            .then((info) => {
                if (_.isNil(info)) {
                    return null;
                }
                return this.sheets.spreadsheets
                    .get({ spreadsheetId: info.id })
                    .then((response) => {
                        return response.data;
                    });
            });
    }

    async deleteSheet(id) {
        return await this.drive.files
            .delete({
                fileId: id,
            })
            .then((response) => {
                console.log(`Sheet ${id} deleted.`);
                return response.data;
            });
    }

    async createNewSheet(sheetName) {
        return await this.sheets.spreadsheets
            .create({
                resource: {
                    properties: {
                        title: sheetName,
                    },
                },
            })
            .then(async (response) => {
                console.log(
                    `New sheet created. Sheet info - ${util.inspect(
                        response.data,
                        { depth: 99 }
                    )}`
                );
                await this.shareSpreadsheet(sheetName, "yap.wilj@gmail.com");
                return response.data;
            });
    }
}
