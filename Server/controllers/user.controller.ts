require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../Models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendEmail from "../utils/sendMail";

// Register User

interface IRegisterationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }
      const user: IRegisterationBody = {
        name,
        email,
        password,
      };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activationMail.ejs"),
        data
      );
      
      try {
        
        await sendEmail({
          email: user.email,
          subject: "Activate Your Account",
          template: "activationMail.ejs",
          data,
        });
        console.log(activationToken);
        
        res.status(200).json({
          success: true,
          message: `Please check your email ${user.email} to activate your account`,
          activationToken: activationToken.token,
        });

      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};


// activate User

interface IActivationRequest{
  activation_token:string;
  activation_code:string;
}

export const activateUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
  try {
    const { activation_token, activation_code } = req.body as IActivationRequest;

    const newUser:{user:IUser; activationCode:string} = jwt.verify(
      activation_token, process.env.ACTIVATION_SECRET as Secret) as {user: IUser; activationCode:string}

      if(newUser.activationCode != activation_code){
        return next(new ErrorHandler("Invalid activation code: " , 400));
      }

      const {name,email,password} = newUser.user;
      const existUser = await userModel.findOne({email});
      if(existUser){
        return next(new ErrorHandler("Email already exist",400));
      }
     await userModel.create({name,email,password}).then(()=>{
      return res.status(200).json({success:true,message:"User Created successfully"})
     }).catch((error:any)=>{
       return next(new ErrorHandler("Somthing went wrong , Please try again...",400));
     })

  } catch (error:any) {
     return next(new ErrorHandler(error.message,400));
  }
})
