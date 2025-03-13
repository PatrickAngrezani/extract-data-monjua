import { calculateScore, FormResponse } from "../services/formService.js";
import knexDW from "./knexDW.js";

export const insertQuestionsDB = async (
  complianceTicketsArray: FormResponse[]
) => {
  let pontuacoes: number[] = [];
  
  for (const processedData of complianceTicketsArray) {
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
        data: processedData.formattedDate,
        idTicket: processedData.idTicket,
        filial: processedData.filial,
        perguntas: JSON.stringify(processedData.perguntas),
        respostas: JSON.stringify(processedData.respostas),
        pontuacao: JSON.stringify(pontuacoes),
      });
    } catch (error) {
      console.error("Erro ao inserir no banco:", error);
    }
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
