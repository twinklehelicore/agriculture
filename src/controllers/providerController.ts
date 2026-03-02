//src/controllers/providerController.ts
import { Request, Response } from "express";
import prisma from '../lib/prisma';
import logger from "../utils/logger";


const listAssignedRequest = async (req: Request, res: Response) =>{
    try{
        const userId = (req as any).user.id;
        const request = await prisma.serviceRequest.findMany({
            where: {id: userId},
            orderBy: {id: 'asc'}
        });
        return res.status(200).json(request);
    }catch(err: any){
        logger.error('Unable to list assigned request');
        return res.status(500).json('Assigned request not listed')
    }
};

export default { listAssignedRequest }
