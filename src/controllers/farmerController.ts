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

//update farm

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

//list all farms

const listFarm = async (req: Request, res: Response) => {
    try{
        const userId = (req as any).user.id;
        const farm = await prisma.farm.findMany({
            where:{userId},
            orderBy: { id: 'desc'}
        });
        return res.status(200).json(farm);
    }catch(err: any){
        logger.error('Unable to list service', err);
        return res.status(500).json('Unable to list service');
    }
};

//get farm by id

const getFarmById = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const userId = (req as any).user.id;
        const farm = await prisma.farm.findFirst({
            where:{ id: Number(id), userId
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

const deleteFarm = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        await prisma.farm.delete({
            where:{id: Number(id),
            }
            
        });
        return res.status(200).json('Your farm is deleted');
    }catch(err: any){
        logger.error('Unable to delete your farm', err);
        return res.status(500).json('Your farm is not deleted');
    }
};


//service request

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
            return res.status(400).json('Farm does not belongs to you');
        }
        const service = await prisma.serviceType.findFirst({
            where:{ id: data.serviceTypeId}
        });
        if(!service){
            return res.status(400).json('Service type is not available');
        }

        data.farmerId = userId;
        await prisma.serviceRequest.create({
            data
        });
        return res.status(200).json('Service request is successful');
    }catch(err: any){
        logger.error('Unable to create service request', err);
        return res.status(500).json('Service request not created')
    }
};

//list my service request
const listMyServiceRequest = async (req: Request, res: Response) => {
    try{
        const userId = (req as any).user.id;
        const request = await prisma.serviceRequest.findMany({
            where:{farmerId: userId},
            orderBy:{id: 'desc'}
        });
        return res.status(200).json(request);
    }catch(err: any){
        logger.error('Unable to list your service requests', err);
        return res.status(500).json('Your service requets not listed');
    }
};

//delete service request

const deleteServiceRequest = async (req: Request, res: Response) => {
    try{
        const userId = (req as any).user.id;
        const { id } = req.params;
        await prisma.serviceRequest.delete({
            where:{id: Number(id),
                farmerId:userId
            }
        });
        return res.status(200).json('Your sevice request deleted successfully');
    }catch(err: any){
        logger.error('Unable to delete your service request', err);
        return res.status(500).json('Your service request not deleted');
        

    }
};
//list crop

const listCrop = async (req: Request, res: Response) => {
  try{
    const crop = await prisma.crop.findMany({
      orderBy:{id: 'desc'}
    });
    return res.status(200).json(crop);
  }catch(err: any){
    logger.error('Unable to list the crop', err);
    return res.status(500).json('Crop not listed');
  }
};

export default {createFarm, updateFarm, listFarm, getFarmById, serviceRequest, listMyServiceRequest, deleteServiceRequest, deleteFarm, listCrop}