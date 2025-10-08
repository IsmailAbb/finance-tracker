import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const createAccount = async (req: Request, res:Response)=>{
    const {name, balance} = req.body;
    const userId = (req as any).userId;

    try{
        const account = await prisma.account.create({data:{name, balance, userId}});
        res.status(201).json(account);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const getAccounts = async (req: Request, res:Response)=>{
    const userId = (req as any).userId; 

    try{
    const accounts = await prisma.account.findMany({where:{userId:userId}, include:{user:true, transactions:true}, orderBy:{name:"desc"}});
    res.status(200).json(accounts);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const updateAccount = async (req: Request, res:Response)=>{
    const {name, balance} = req.body;
    const userId = (req as any).userId;
    const {id} = req.params;

    try{
        const account = await prisma.account.findFirst({where:{id:Number(id), userId}});
        if (!account) return res.status(404).json({message:"Account not found"});
        const updatedAccount = await prisma.account.update({where:{id:Number(id)},data:{name,balance}});
        res.status(200).json(updatedAccount);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const deleteAccount = async (req: Request, res:Response)=>{
    const userId = (req as any).userId;  
    const {id} = req.params;

    try{
        const account = await prisma.account.findFirst({where:{id:Number(id), userId}});
        if (!account) return res.status(404).json({message:"Account not found"});
        await prisma.account.delete({where:{id:Number(id)}});
        res.status(200).json({message:"Account deleted successfully"});
    }
    catch(err){
        res.status(500).json({error:err});
    }
};