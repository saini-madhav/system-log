import { Router } from "express";
import SystemRouter from "./routes/systemRoutes";

const Routes = Router();

Routes.use("/system", SystemRouter);


export default Routes;


