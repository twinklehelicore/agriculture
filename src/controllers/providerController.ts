//src/controllers/providerController.ts
import { Request, Response } from "express";
import prisma from '../lib/prisma';
import logger from "../utils/logger";
import { createNotification } from '../utils/notify';



const listAssignedRequest = async (req: Request, res: Response) =>{
    try{
        const providerId = (req as any).user.id;
        const request = await prisma.serviceRequest.findMany({
            where: {providerId},
            orderBy: {id: 'desc'}
        });
        return res.status(200).json(request);
    }catch(err: any){
        logger.error('Unable to list assigned request');
        return res.status(500).json('Assigned request not listed')
    }
};

const approvedRequest = async (req: Request, res: Response) => {
    try{
        const providerId = (req as any).user.id;
        const { id } = req.params;
        const request = await prisma.serviceRequest.findFirst({
            where: { id: Number(id), providerId },
            include: { serviceType: true }
    });
    if (!request) return res.status(400).json('Request not found');

        await prisma.serviceRequest.updateMany({

            where:{id: Number(id),
            providerId,
            status:'ASSIGNED'
            },
            data: {status:'APPROVED',
            approvedAt: new Date()
            }
            
        });
         await createNotification(
            request.farmerId,
            ' Request Approved',
            `Your ${request.serviceType.name} request has been approved by the provider.`
    );
   
        return res.status(200).json('Request approved');
    }catch(err: any){
        logger.error('Unable to approved the request', err);
        return res.status(500).json('Request not approved');
    }
};

const inprogressRequest = async (req: Request, res: Response) => {
    try{
        const providerId = (req as any).user.id;
        const { id } = req.params;
        await prisma.serviceRequest.updateMany({
            where:{
                id: Number(id),
                providerId,
                status: 'APPROVED'
            },
            data: {
                status:'IN_PROGRESS',

            }
        });
        return res.status(200).json('Request in progress');
    }catch(err: any){
        logger.error('Unable to change status');
        return res.status(500).json('Cannot change the status');
    }
};

const rejectRequest = async (req: Request, res: Response) => {
    try{
        const providerId = (req as any).user.id;
        const { id } = req.params;
        
        await prisma.serviceRequest.updateMany({
            where:{ id: Number(id),
                providerId,
                status: 'ASSIGNED'
            },
            data:{
                status: 'REJECTED'
            }
        });
        return res.status(200).json('Request rejected');
    }catch(err: any){
        logger.error('Unable to reject the request', err);
        return res.status(500).json('Request not rejected');
    }
};

const completedRequest = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const providerId = (req as any).user.id;
        const request = await prisma.serviceRequest.findFirst({
            where: { id: Number(id), providerId },
            include: { serviceType: true }
        });
        if (!request) return res.status(400).json('Request not found');

        await prisma.serviceRequest.updateMany({
            where:{
                id: Number(id),
                providerId,
                status: 'IN_PROGRESS'
            },
            data:{
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });
         await createNotification(
            request.farmerId,
            ' Service Completed',
            `Your ${request.serviceType.name} service has been completed successfully!`
    );
        return res.status(200).json('Request completed');
    }catch(err: any){
        logger.error('Unable to change status to completed');
        return res.status(500).json('Request not completed')
    }
};


export default { listAssignedRequest, approvedRequest, inprogressRequest, rejectRequest, completedRequest}
