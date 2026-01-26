import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParseResult {
    data: any[];
    headers: string[];
    error?: string;
}

export const FileParser = {
    async parse(file: File): Promise<ParseResult> {
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'csv') {
            return this.parseCSV(file);
        } else if (['xlsx', 'xls'].includes(extension || '')) {
            return this.parseExcel(file);
        } else {
            return { data: [], headers: [], error: 'Unsupported file format' };
        }
    },

    async parseCSV(file: File): Promise<ParseResult> {
        try {
            const text = await file.text();
            return new Promise((resolve) => {
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results: Papa.ParseResult<any>) => {
                        if (results.meta.fields) {
                            resolve({
                                data: results.data,
                                headers: results.meta.fields
                            });
                        } else {
                            resolve({
                                data: [],
                                headers: [],
                                error: 'Could not parse CSV headers'
                            });
                        }
                    },
                    error: (error: Error) => {
                        resolve({
                            data: [],
                            headers: [],
                            error: error.message
                        });
                    }
                });
            });
        } catch (e: any) {
            return { data: [], headers: [], error: `Failed to read CSV: ${e.message}` };
        }
    },

    async parseExcel(file: File): Promise<ParseResult> {
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            if (jsonData.length === 0) {
                return { data: [], headers: [], error: 'Empty file' };
            }

            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1).map((row: any) => {
                const obj: any = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });

            return {
                data: rows,
                headers: headers
            };
        } catch (error: any) {
            return { data: [], headers: [], error: `Failed to parse Excel file: ${error.message || error}` };
        }
    }
};
