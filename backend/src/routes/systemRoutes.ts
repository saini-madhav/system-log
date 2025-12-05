
import { Router } from "express";
import { getLog } from "../controller/systemController";

const systemRouter = Router();

systemRouter.get("/log", getLog);


export default systemRouter;