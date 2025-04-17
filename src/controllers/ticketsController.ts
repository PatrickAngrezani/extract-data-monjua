import axios from "axios";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as dotenv from "dotenv";
import cron from "node-cron";

import { getAccessToken, refreshToken } from "../services/authService.js";
import { insertQuestionsDB } from "../database/insertQuestions.js";
import knexDW from "../database/knexDW.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/../../.env` });

const departmentId = process.env.DEPARTMENT_ID;

// to do: Atualizar pra buscar em banco
const queryRetrieveLastTicket = await knexDW("dbo.fPontuacaoAuditoria")
  .orderBy("idTicket", "desc")
  .first();
let lastTicketReviewed = queryRetrieveLastTicket.idTicket;

let complianceTicketsArray = [];

export const retrieveTickets = async () => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get("https://desk.zoho.com/api/v1/tickets", {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        orgId: Number(814785537),
      },
    });

    // promisse.all + map (mapeia resultados e aguarda todas requisições desejadas)
    await Promise.all(
      response.data.data
        .filter(
          (item: { departmentId: string; ticketNumber: string }) =>
            item.departmentId == departmentId &&
            Number(item.ticketNumber) > lastTicketReviewed
        ) // filtra departamento correto
        .map(async (item: { id: string }) => {
          try {
            const complianceTickets = await axios.get(
              `https://desk.zoho.com/api/v1/tickets/${item.id}?include=departments`,
              {
                headers: {
                  Authorization: `Zoho-oauthtoken ${accessToken}`,
                  orgId: Number(814785537),
                },
              }
            );

            // filtra tickets do compliance
            if (
              complianceTickets.data.customFields["Serviço"] ===
              "Auditoria Compliance"
            ) {
              const questions = captureQuestions(complianceTickets);

              const creationDate = String(
                new Date(complianceTickets.data.createdTime)
              );
              const formattedDate = new Date(creationDate).toLocaleDateString(
                "pt-BR"
              );

              // adiciona os dados filtrados ao array de tickets processados
              complianceTicketsArray.push({
                idTicket: Number(complianceTickets.data["ticketNumber"]),
                filial: captureBranchName(complianceTickets),
                formattedDate,
                perguntas: questions.map((q) => q.pergunta),
                respostas: questions.map((q) => {
                  if (
                    q.pergunta === "Índice de Inventário:" &&
                    typeof q.resposta === "string" &&
                    q.resposta.includes(".")
                  ) {
                    return q.resposta.replace(".", ",");
                  } else {
                    return q.resposta;
                  }
                }),
              });

              // atualiza lastTicketReviewed para o maior ticketNumber encontrado
              lastTicketReviewed = Math.max(
                lastTicketReviewed,
                Number(complianceTickets.data["ticketNumber"])
              );

              return insertQuestionsDB(
                complianceTicketsArray,
                lastTicketReviewed
              );
            }
          } catch (error) {
            console.error(
              `Erro ao processar o ticket ${item.id}:`,
              error.message
            );
          }
        })
    );
  } catch (error: any) {
    console.error("Error retrieving tickets:", error.response?.data);

    if (error.response.data.errorCode === "INVALID_OAUTH") {
      await refreshToken();
      return retrieveTickets();
    }

    throw error;
  }
};

function captureBranchName(complianceTickets: any): string {
  const branchName =
    Object.entries(complianceTickets.data.customFields).find(
      ([question]) => question === "Selecione sua filial"
    )[1] || null;

  return String(branchName);
}

function captureQuestions(complianceTickets: any) {
  const questions = Object.entries(complianceTickets.data.customFields)
    .filter(
      ([question, response]) =>
        response !== null &&
        ![
          "Nome para contato",
          "Selecione sua filial",
          "Teste",
          "Serviço",
        ].includes(question)
    )
    .map(([pergunta, resposta]) => {
      return { pergunta, resposta };
    });

  return questions;
}

cron.schedule("0 23 * * *", async () => {
  console.log("Executando a rotina agendada para busca de tickets.");
  await retrieveTickets();
  console.log({ lastTicketReviewed });
});

console.log(
  "Primeira busca de tickets realizada... Aguardando nova busca agendada."
);
await retrieveTickets();
console.log({ lastTicketReviewed });
