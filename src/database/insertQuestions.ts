import { calculateScore, FormResponse } from "../services/formService.js";
import knexDW from "./knexDW.js";

// interface AuditScore {
//   data: string;
//   idTicket: number;
//   filial: string;
//   perguntas: string[];
//   respostas: string[];
//   pontuacao: number[];
// }

export const insertQuestionsDB = async (processedData: FormResponse) => {
  let pontuacoes: number[] = [];
  try {
    // map + promise.all para aguardar todas pontuações
    pontuacoes = await Promise.all(
      processedData.perguntas.map(async (question, index) => {
        const answer = processedData.respostas[index];
        const score = calculateScore(question, answer);

        return score;
      })
    );

    await knexDW("dbo.fPontuacaoAuditoria").insert({
      data: processedData.data,
      idTicket: processedData.idTicket,
      filial: processedData.filial,
      perguntas: JSON.stringify(processedData.perguntas),
      respostas: JSON.stringify(processedData.respostas),
      pontuacao: JSON.stringify(pontuacoes),
    });
  } catch (error) {
    console.error("Erro ao inserir no banco:", error);
  }
};

// async function testConnection() {
//   try {
//     const result = await knexDW.raw("SELECT 1 AS Teste");
//     console.log("Conexão bem-sucedida:", result);
//   } catch (error) {
//     console.error("Erro ao conectar no banco:", error);
//   } finally {
//     knexDW.destroy();
//   }
// }

// testConnection();
