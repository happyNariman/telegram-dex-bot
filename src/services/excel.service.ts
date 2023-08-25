import { Logger } from 'winston';
import { Readable } from 'stream';
import * as xlsx from 'xlsx';

export class ExcelService {

    constructor(private logger: Logger) { }

    async generateFile(title: string, headers: string[], data: string[][], headersWidths?: xlsx.ColInfo[]): Promise<Readable> {

        const worksheet: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet([headers, ...data]);

        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '0074D9' } }
        };
        for (let i = 0; i < headers.length; i++) {
            const cellAddress = xlsx.utils.encode_cell({ c: i, r: 0 });
            worksheet[cellAddress].s = headerStyle;
        }

        if (headersWidths) {
            worksheet['!cols'] = headersWidths;
        }

        const workbook: xlsx.WorkBook = {
            Sheets: { 'Sheet 1': worksheet },
            SheetNames: ['Sheet 1']
        };

        const excelBuffer: Buffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'buffer'
        });

        const excelStream = new Readable();
        excelStream._read = () => { };
        excelStream.push(excelBuffer);
        excelStream.push(null);

        return excelStream;
    }

}
