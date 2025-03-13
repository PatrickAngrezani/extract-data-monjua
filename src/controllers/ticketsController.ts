import axios from "axios";
import { getAccessToken, refreshToken } from "../services/authService.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as dotenv from "dotenv";
import { insertQuestionsDB } from "../database/insertQuestions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/../../.env` });

const departmentId = process.env.DEPARTMENT_ID;

let lastTicketReviewed: number = 0;
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
          (item: { departmentId: string }) => item.departmentId == departmentId
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
              
              // filtra questionário
              // monta array de pares valores [key, value]
              // const filteredData = Object.entries(
              //   complianceTickets.data.customFields
              // )
              //   .filter(
              //     ([question, response]) =>
              //       response !== null &&
              //       ![
              //         "Nome para contato",
              //         "Selecione sua filial",
              //         "Teste",
              //         "Serviço",
              //       ].includes(question)
              //   )
              //   // transforma o array em objeto | acc obj vazio inicialmente {}
              //   .reduce((acc, [key, value]) => {
              //     acc[key] = value;
              //     return acc;
              //   }, {} as Record<string, any>);

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
                respostas: questions.map((q) => q.resposta),
              });

              // atualiza lastTicketReviewed para o maior ticketNumber encontrado
              lastTicketReviewed = Math.max(
                lastTicketReviewed,
                Number(complianceTickets.data["ticketNumber"])
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

    return insertQuestionsDB(complianceTicketsArray);
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

retrieveTickets();
