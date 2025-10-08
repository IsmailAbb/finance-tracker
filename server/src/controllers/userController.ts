import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const getUser = async (req: Request, res:Response)=>{
    const userId = (req as any).userId; 

    try{
    const user = await prisma.user.findUnique({where:{id:userId}, include:{accounts:true, transactions:true, categories:true}});
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const updateUser = async (req: Request, res:Response)=>{
    const {email, password, name} = req.body;
    const userId = (req as any).userId;

    try{
    const user = await prisma.user.findUnique({where:{id:userId}});
    if (!user) return res.status(404).json({message:"User not found"});
    const updatedUser = await prisma.user.update({where:{id:userId}, data:{email, password, name}});
    res.status(200).json(updatedUser);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const deleteUser = async (req: Request, res:Response)=>{
    const userId = (req as any).userId;  

    try{
    const user = await prisma.user.findUnique({where:{id:userId}});
    if (!user) return res.status(404).json({message:"User not found"});
    await prisma.user.delete({where:{id:userId}});
    res.status(200).json({message:"User deleted successfully"});
    }
    catch(err){
        res.status(500).json({error:err});
    }
};