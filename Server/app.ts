require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";

import { ErrorMiddleWare } from "./middlewares/error";

//body-parser

app.use(express.json({limit: "50mb"}));

app.use(cookieParser())
app.use(cors({
    origin: process.env.ORIGIN
}));

//Routes 
import { UserRoute } from "./Routes/user.route";
app.use('/api/v1', UserRoute)


app.get("/", (req:Request,res:Response, next:NextFunction)=>{
    res.send("Welcome")
})

app.all("*", (req:Request, res:Response, next:NextFunction)=>{
    const err = new Error(`Route "${req.originalUrl}" NOt FOUND`) as any;
    err.status = 404;

    next(err);
})

app.use(ErrorMiddleWare)