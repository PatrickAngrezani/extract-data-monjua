export interface FormResponse {
    pergunta: string;
    resposta: string | string[];
    timestamp?: Date;
};

export const processFormData = (rawData): FormResponse[] => {   
    let questions; 
    for (const data of rawData) {
         questions = Object.entries(data.payload.customFields)
        .filter(([_, response]) => response !== null)
        .map(([pergunta, resposta]) => ({
            pergunta,
            resposta
        }));
    }
    questions.sort((a, b) => a.pergunta.localeCompare(b.pergunta));    

    return questions;
};
