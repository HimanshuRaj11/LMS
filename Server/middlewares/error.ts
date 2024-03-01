import ErrorHandeler from "../utils/ErrorHandler";
import {Request, Response, NextFunction} from "express"

export const ErrorMiddleWare =(err:any, req:Request, res:Response, next:NextFunction) =>{
    err.statusCode = err.statusCode||500;
    err.message = err.message || "Internal Server Error";

    // Wrong Mongodb Error
    if(err.name==='CastError'){
        const message = `Resource not foind. Invalid: ${err.path}`;
        err = new ErrorHandeler(message, 400);
    }

    //Duplicate key Error
    if(err.code===11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandeler(message, 400);
    }

    // Wrong JWT error
    if(err.name==="jsonwebTokenError"){
        const message = `Your Token is invalid, Please try again!`;
        err = new ErrorHandeler(message,400);
    }

    //JWT expires error
    if(err.name==="TokenExpiredError"){
        const message = `Your Token is Expired, Please try again!`;
        err = new ErrorHandeler(message,400);
    }

    res.status(err.statusCode).json({
        success : false,
        message : err.message
    })
}