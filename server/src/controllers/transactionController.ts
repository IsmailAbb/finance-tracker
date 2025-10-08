import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const createTransaction = async (req: Request, res:Response)=>{
    const {amount, date, description, accountId, categoryId} = req.body;
    const userId = (req as any).userId;

    try{
        const transaction = await prisma.transaction.create({data:{amount, date: new Date(date), description, accountId, categoryId, userId}});
        res.status(201).json(transaction);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const getTransactions = async (req: Request, res:Response)=>{
    const userId = (req as any).userId; 

    try{
    const transactions = await prisma.transaction.findMany({where:{userId:userId}, include:{account:true, category:true}, orderBy:{date:"desc"}});
    res.status(200).json(transactions);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const updateTransaction = async (req: Request, res:Response)=>{
    const {amount, date, description, accountId, categoryId} = req.body;
    const userId = (req as any).userId;
    const {id} = req.params;

    try{
        const transaction = await prisma.transaction.findFirst({where:{id:Number(id), userId}});
        if (!transaction) return res.status(404).json({message:"Transaction not found"});
        const updatedTransaction = await prisma.transaction.update({where:{id:Number(id)},data:{amount, date: new Date(date), description, accountId, categoryId}});
        res.status(200).json(updatedTransaction);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const deleteTransaction = async (req: Request, res:Response)=>{
    const userId = (req as any).userId;  
    const {id} = req.params;

    try{
        const transaction = await prisma.transaction.findFirst({where:{id:Number(id), userId}});
        if (!transaction) return res.status(404).json({message:"Transaction not found"});
        await prisma.transaction.delete({where:{id:Number(id)}});
        res.status(200).json({message:"Transaction deleted successfully"});
    }
    catch(err){
        res.status(500).json({error:err});
    }
};