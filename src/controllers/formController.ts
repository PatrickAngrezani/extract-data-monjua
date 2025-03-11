import { Request, Response } from "express";
import { FormResponse, processFormData } from "../services/formService.js";
import { saveToSpreadsheet } from "../utils/excelWriter.js";
import { insertQuestionsDB } from "../database/insertQuestions.js";

export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const formData = req.body;

    //process datas
    const processedData: FormResponse = processFormData(formData);

    await saveToSpreadsheet(processedData);
    await insertQuestionsDB(processedData);
    res.status(200).send("Data received succesfully");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Intern error at server");
  }
};
