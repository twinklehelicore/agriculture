//src/controllers/farmerController.ts
import { Request, Response } from "express";
import prisma from '../lib/prisma';
import logger from "../utils/logger";


//create farm
const createFarm = async (req: Request, res: Response) => {
    try{
        const data = req.body;
        data.userId = (req as any).user.id;
        await prisma.farm.create({
            data :data

        });
        return res.status(200).json('Farm created sucessfully');
    }catch(err: any){
        logger.error('Unable to create farm');
        return res.status(500).json('Farm not created');
    }
};

const updateFarm = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const data = req.body;
        const userId = (req as any).user.id;
        

        const farm = await prisma.farm.findFirst({
      where: {
        id: Number(id),
        userId,
      },
    });
    if (!farm) {
        return res.status(400).json({ error: 'Farm not found or not yours' });
    }
    await prisma.farm.update({
        where: { id: Number(id) },
        data: data,
    });
    return res.status(200).json('Farm updated');
    } catch(err: any){
        logger.error('Unable to update farm', err);
        return res.status(500).json('Farm not updated');
    }
};

const listFarm = async (req: Request, res: Response) => {
    try{
        const userId = (req as any).user.id;
        const farm = await prisma.farm.findMany({
            where:{userId},
            orderBy: { id: 'asc'}
        });
        return res.status(200).json(farm);
    }catch(err: any){
        logger.error('Unable to list service', err);
        return res.status(500).json('Unable to list service');
    }
};

const getFarmById = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const userId = (req as any).user.id;
        const farm = await prisma.farm.findFirst({
            where:{ id: Number(id)
                , userId
            }  
        });
        if(!farm){
            return res.status(400).json('Farm not found');
        }
        return res.status(200).json(farm)
    }catch(err: any){
        logger.error('Unable to find farm', err);
        return res.status(500).json('Unable to find a farm');
    }
};

const serviceRequest = async (req: Request, res: Response) => {
    try{
        const userId = (req as any).user.id;
        const data = req.body;
        const farm = await prisma.farm.findFirst({
            where:{
                id: data.farmId, 
                userId
            }
        });
        if(!farm){
            return res.status(400).json('Farm doesnot belongs to you');
        }
        const service = await prisma.serviceType.findFirst({
            where:{ id: data.serviceTypeId}
        });
        if(!service){
            return res.status(400).json('Service type is not available');
        }
        await prisma.serviceRequest.create({
            data
        });
        return res.status(200).json('Service request is successful');
    }catch(err: any){
        logger.error('Unable to create service request', err);
        return res.status(500).json('Service request not created')
    }
}
export default {createFarm, updateFarm, listFarm, getFarmById, serviceRequest}