import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "Text";

export const register = async (req: Request, res: Response)=> {
    const {email, password, name} = req.body;

    try{
        const userExists = await prisma.user.findUnique({where:{email}});
        if (userExists) return res.status(400).json({message:"user already exists"});

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({data:{email, password:hashedPassword, name}});
        const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "1h"});
        return res.status(201).json({token, user:{id:user.id, email:user.email, name:user.name}});
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const login = async (req: Request, res: Response)=> {
    const {email, password} = req.body;

    try{
        const user = await prisma.user.findUnique({where:{email}});
        if (!user) return res.status(400).json({message:"incorrect email or password"});
        
        const passwordVerification = await bcrypt.compare(password, user.password);
        if(!passwordVerification) return res.status(400).json("incorrect email or password");
        
        const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "1h"});
        return res.status(201).json({token, user:{id:user.id, email:user.email, name:user.name}});

    }
    catch(err){
        res.status(500).json({error:err});
    }
};