export interface FormResponse {
  data: Date;
  ticketID: string;
  filial: string;
  perguntas: string[];
  respostas: string[];
}

const questionScoreTable = {
  "Confissões de dívida armazenados em local correto?": {
    Sim: 5,
    Não: 0,
  },
  "Confissões de dívida estão assinadas?": {
    "1 confissão sem assinatura": 13.5,
    "2 a 3 confissões sem assinatura": 10.5,
    "4 a 5 confissões sem assinatura": 7.5,
    "Todas as confissões estão corretas": 15,
  },
  "Numerário em caixa está correto conforme Política?": {
    Sim: 15,
    Não: 0,
  },
  "As planilhas de conferência estão preenchidas?": {
    Sim: 8,
    Não: 0,
  },
  "Há condicionais em aberto há mais de 48 horas?": {
    Sim: 0,
    Não: 5,
  },
  "Reservas são realizadas de acordo com a politica?": {
    "Filial possui reservas há mais de 48 horas": 0,
    "Filial possui reservas dentro do prazo e de acordo com a política": 5,
    "Filial não realiza o controle das reservas": 0,
  },
  "A filial utiliza o cofre?": {
    Sim: 2,
    Nâo: 0,
  },
  "O cofre está localizado em local correto?": {
    Sim: 2,
    Não: 0,
  },
  "Somente o gerente possui acesso ao cofre?": {
    Sim: 2,
    Não: 0,
  },
  "Filial está digitalizando os depósitos?": {
    Sim: 0,
    Não: 0,
  },
  "A área dos caixas estão organizados?": {
    Sim: 2,
    Não: 0,
  },
  "O salão de vendas está organizado?": {
    Sim: 2,
    Não: 0,
  },
  "O estoque está organizado e limpo ?": {
    Sim: 2,
    Não: 0,
  },
  "O alvará está exposto e dentro da validade?": {
    "Alvará exposto e vigente": 2,
    "Alvará exposto mas vencido": 1,
    "Alvará vigente mas não está exposto": 1,
    "Em desacordo com o processo de regularização em andamento com o jurídico": 2,
    "Filial sem alvará": 0,
  },
  "Quadro de trocas está em local visível ao cliente?": {
    Sim: 2,
    Não: 0,
  },
  "CDC está exposto em local visível para o cliente?": {
    Sim: 2,
    Não: 0,
  },
  "O Código de Cultura está exposto": {
    Sim: 2,
    Não: 0,
  },
  "O quadro informativo da LGPD está exposto?": {
    Sim: 2,
    Não: 0,
  },
  "As placas de monitoramento estão expostas?": {
    Sim: 2,
    Não: 0,
  },
  "Os documentos do Canal de Denúncia estão expostos?": {
    Sim: 2,
    Não: 0,
  },
  "Informativo Legislação Varejo Legal esta exposto?": {
    Sim: 1,
    Não: 0,
  },
  "Placas Seguro Prestamista exposto para clientes?": {
    Sim: 0,
    Não: 0,
  },
  "Está tocando a Rádio Monjuá?": {
    Sim: 3,
    Não: 0,
  },
  "Quantidade de produtos sem etiqueta": {
    "Até 0.9 porcento do estoque": 5,
    "Acima de 09 porcento do estoque": 0,
  },
  "Indice de Inventário": {
    "Até 0.200 porcento": 15,
    "Acima de 0.249 porcento": 0,
    "Entre 0.201 porcento e 0.249 porcento": 7.5,
  },
};

export const processFormData = (rawData): FormResponse => {
  let formattedDate: Date;
  let ticketID: string;
  let branchName;
  let questions;

  for (const data of rawData) {
    const creationDate = new Date(data.payload.createdTime);
    formattedDate = new Date(creationDate.toLocaleDateString("pt-BR"));

    ticketID = data.payload.ticketNumber;

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

  console.log({ questions });

  return questions;
}
