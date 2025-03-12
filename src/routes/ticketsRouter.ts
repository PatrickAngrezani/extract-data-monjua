import { Router } from "express";
import { retrieveTickets } from "../controllers/ticketsController.js";

const router = Router();

router.get("/", retrieveTickets);
