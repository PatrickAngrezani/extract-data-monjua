import { Request, Response } from "express";
import { processFormData } from '../services/formService.js'
import { saveToSpreadsheet } from '../utils/excelWriter.js'

export const receiveWebhook = async (req: Request, res: Response) => {
    try {
        const formData = req.body;

        //process datas
        const processedData = processFormData(formData);
        
        await saveToSpreadsheet(processedData);
        res.status(200).send('Data received succesfully');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Intern error at server');
    }
}