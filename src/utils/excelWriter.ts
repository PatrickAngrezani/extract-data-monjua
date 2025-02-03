import ExcelJS from 'exceljs';
import { FormResponse } from '../services/formService.js';

const SPREADSHEET_PATH = './spreadsheets/respostas.xlsx';

export const saveToSpreadsheet = async (data: FormResponse[]) => {
    const workbook = new ExcelJS.Workbook();
    console.log({data});
    

    try {
        await workbook.xlsx.readFile(SPREADSHEET_PATH);
    } catch (error) {
        //create new spreadsheet if it doesn't exist
        const worksheet = workbook.addWorksheet('respostas');
        worksheet.columns = [
            {header: 'Data', key: 'timestamp'},
            {header: 'ID Pergunta', key: 'questionId'},
            {header: 'Pergunta', key: 'questionText'},
            {header: 'Resposta', key: 'answer'}
        ];
    }

    const worksheet = workbook.getWorksheet('respostas');

    data.forEach(response => {
        worksheet?.addRow({
            timestamp: response.timestamp,
            questionText: response.pergunta,
            answer: response.resposta,
        });
    });

    await workbook.xlsx.writeFile(SPREADSHEET_PATH);
}