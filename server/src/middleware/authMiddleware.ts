import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "Text";

export const authenticate = (req:Request, res:Response, next:NextFunction)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({message:"request missing authorization header"});
    
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try{
        const payload = jwt.verify(token, JWT_SECRET) as unknown as {userId: number};
        (req as any).userId = payload.userId;
        next();
    }
    catch(err){
        res.status(500).json({error:err});
    }
};