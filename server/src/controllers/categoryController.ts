import {Request, Response} from "express";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const createCategory = async (req: Request, res:Response)=>{
    const {name, type} = req.body;
    const userId = (req as any).userId;

    try{
        const category = await prisma.category.create({data:{name, type, userId}});
        res.status(201).json(category);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const getCategories = async (req: Request, res:Response)=>{
    const userId = (req as any).userId; 

    try{
    const categories = await prisma.category.findMany({where:{userId:userId}, include:{user:true, transactions:true}, orderBy:{name:"desc"}});
    res.status(200).json(categories);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const updateCategory = async (req: Request, res:Response)=>{
    const {name, type} = req.body;
    const userId = (req as any).userId;
    const {id} = req.params;

    try{
        const category = await prisma.category.findFirst({where:{id:Number(id), userId}});
        if (!category) return res.status(404).json({message:"Category not found"});
        const updatedCategory = await prisma.category.update({where:{id:Number(id)},data:{name, type}});
        res.status(200).json(updatedCategory);
    }
    catch(err){
        res.status(500).json({error:err});
    }
};

export const deleteCategory = async (req: Request, res:Response)=>{
    const userId = (req as any).userId;  
    const {id} = req.params;

    try{
        const category = await prisma.category.findFirst({where:{id:Number(id), userId}});
        if (!category) return res.status(404).json({message:"Category not found"});
        await prisma.category.delete({where:{id:Number(id)}});
        res.status(200).json({message:"Category deleted successfully"});
    }
    catch(err){
        res.status(500).json({error:err});
    }
};