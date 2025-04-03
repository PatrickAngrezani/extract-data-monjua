export interface FormResponse {
  formattedDate: string;
  idTicket: string;
  filial: string;
  perguntas: string[];
  respostas: string[];
}

export let totalScore: number = 0;

export const questionScoreTable: Record<string, Record<string, number>> = {
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
  "A filial utiliza cofre e esta em local correto?": {
    "Sim e esta em local correto": 2,
    "Sim, porém não está em local correto": 1,
    Não: 0,
    "N/A": 0,
  },
  "Somente o gerente possui acesso ao cofre?": {
    Sim: 2,
    Não: 0,
    "N/A": 0,
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
  "Alvará dos Bombeiros exposto e dentro da validade?": {
    "Alvará exposto e vigente": 2,
    "Alvará exposto mas vencido": 1,
    "Alvará vigente mas não está exposto": 1,
    "Em desacordo com o processo de regularização em andamento com o jurídico": 2,
    "Filial sem alvará": 0,
  },
  "O alvará de Funcionamento exposto e valido?": {
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
  "O Código de Cultura está exposto?": {
    Sim: 0,
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
  "Informativos Seguro Prestamista exposto?": {
    Sim: 0,
    Não: 0,
    "N/A": 0,
  },
  "Está tocando a Rádio Monjuá?": {
    Sim: 3,
    Não: 0,
  },
  "Quantidade de produtos sem etiqueta": {
    "Até 0.9 porcento do estoque": 5,
    "Acima de 09 porcento do estoque": 0,
  },
  "Índice de Inventário:": {
    "Até 0.200 porcento": 15,
    "Acima de 0.249 porcento": 0,
    "Entre 0.201 porcento e 0.249 porcento": 7.5,
  },
};

export const processFormData = (rawData): FormResponse => {
  let formattedDate: string;
  let idTicket: string;
  let branchName;
  let questions;

  for (const data of rawData) {
    const creationDate = String(new Date(data.payload.createdTime));
    formattedDate = new Date(creationDate).toLocaleDateString("pt-BR");

    idTicket = data.payload.ticketNumber;

    branchName = captureBranchName(data);
    questions = captureQuestions(data);
  }

  questions.sort((a, b) => a.pergunta.localeCompare(b.pergunta));

  return {
    formattedDate,
    idTicket,
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

export function calculateScore(question: string, answer: string): number {
  if (question === "Índice de Inventário:") {
    const resultado = calculateInventario(String(answer));
    const indPoints: number = Number(
      questionScoreTable[question]?.[resultado] ?? 0
    );
    totalScore += indPoints;

    return questionScoreTable[question][resultado];
  }

  if (
    questionScoreTable[question] &&
    questionScoreTable[question][answer] !== undefined
  ) {
    const points: number = Number(questionScoreTable[question][answer]);
    totalScore += points;

    return questionScoreTable[question][answer];
  }

  return 0;
}

export function calculateInventario(resposta: string): string {
  const valor = Number(resposta.replace(",", "."));

  if (valor >= 0 && valor <= 0.2) {
    return "Até 0.200 porcento";
  } else if (valor > 0.2 && valor <= 0.249) {
    return "Entre 0.201 porcento e 0.249 porcento";
  } else if (valor > 0.249) {
    return "Acima de 0.249 porcento";
  }
}

export function resetScore() {
  totalScore = 0;
}
