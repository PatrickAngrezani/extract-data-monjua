import ExcelJS from "exceljs";
import { calculateScore, FormResponse } from "../services/formService.js";

const SPREADSHEET_PATH = "./spreadsheets/respostas.xlsx";

export const saveToSpreadsheet = async (processedData: FormResponse) => {
  let worksheet;
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(SPREADSHEET_PATH);
    worksheet = workbook.getWorksheet("respostas");
  } catch (error) {
    console.log("Arquivo não encontrado. Criando novo...");
  }

  if (!worksheet) {
    worksheet = workbook.addWorksheet("respostas");
  }

  worksheet.columns = [
    { header: "Data Abertura", key: "date" },
    { header: "ID Ticket", key: "idTicket" },
    { header: "Filial", key: "branch" },
    { header: "Perguntas", key: "questions" },
    { header: "Respostas", key: "answer" },
    { header: "Pontuação", key: "score" },
  ];

  processedData.perguntas.forEach((question, index) => {
    const answer = processedData.respostas[index];
    const score = calculateScore(question, answer);

    worksheet.addRow({
      date: processedData.data,
      idTicket: processedData.ticketID,
      branch: processedData.filial,
      questions: question,
      answer,
      score,
    });
  });

  await workbook.xlsx.writeFile(SPREADSHEET_PATH);
};
