export interface FormResponse {
  data: Date;
  ticketID: string;
  filial: string;
  perguntas: string[];
  respostas: string[];
}

export const processFormData = (rawData): FormResponse => {
  let formattedDate: Date;
  let ticketID: string;
  let branchName;
  let questions;

  for (const data of rawData) {
    const creationDate = new Date(data.payload.createdTime);
    formattedDate = new Date(creationDate.toLocaleDateString("pt-BR"));

    ticketID = data.payload.ticketNumber;

    //capture origin
    branchName = captureBranchName(data);
    questions = captureQuestions(data);
  }

  questions.sort((a, b) => a.pergunta.localeCompare(b.pergunta));

  return {
    data: formattedDate,
    ticketID,
    filial: branchName,
    perguntas: questions.map((q) => q.pergunta),
    respostas: questions.map((q) => q.resposta),
  };
};

function captureBranchName(data: any): string {
  const branchName =
    Object.entries(data.payload.customFields).find(
      ([question]) => question === "Selecione sua filial"
    )[1] || null;

  return String(branchName);
}

function captureQuestions(data: any): {} {
  const questions = Object.entries(data.payload.customFields)
    .filter(
      ([question, response]) =>
        response !== null &&
        question !== "Nome para contato" &&
        question !== "Selecione sua filial" &&
        question !== "Teste" &&
        question !== "Serviço"
    )
    .map(([pergunta, resposta]) => ({ pergunta, resposta }));

  return questions;
}
