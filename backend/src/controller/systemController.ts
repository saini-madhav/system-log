import express, { Request, Response } from "express";
import { getSystemLog } from "../features/system";



export const getLog = async(req: Request, res: Response) => {
  return await getSystemLog(req, res);
}

