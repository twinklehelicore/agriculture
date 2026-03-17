//src/controllers/providerController.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../utils/logger";
import { getAdminId } from "../utils/getAdminId";

const listAssignedRequest = async (req: Request, res: Response) => {
  try {
    const providerId = (req as any).user.id;
    const request = await prisma.serviceRequest.findMany({
      where: { providerId },
      orderBy: { id: "desc" },
    });
    return res.status(200).json(request);
  } catch (err: any) {
    logger.error("Unable to list assigned request");
    return res.status(500).json("Assigned request not listed");
  }
};

const approvedRequest = async (req: Request, res: Response) => {
  try {
    const providerId = (req as any).user.id;
    const { id } = req.params;
    const request = await prisma.serviceRequest.findFirst({
      where: { id: Number(id), providerId },
      include: { serviceType: true },
    });
    if (!request) return res.status(400).json("Request not found");

    await prisma.serviceRequest.updateMany({
      where: { id: Number(id), providerId, status: "ASSIGNED" },
      data: { status: "APPROVED", approvedAt: new Date() },
    });
    const adminId = await getAdminId();

    await prisma.notification.createMany({
      data: [
        {
          userId: request.farmerId,
          title: "Request Approved",
          message: `Your ${request.serviceType.name} request #${request.id} has been approved.`,
        },
        {
          userId: adminId!,
          title: "Request Approved",
          message: `${request.serviceType.name} request #${request.id} has been approved by provider.`,
        },
      ],
    });
    return res.status(200).json("Request approved");
  } catch (err: any) {
    logger.error("Unable to approved the request", err);
    return res.status(500).json("Request not approved");
  }
};

const inprogressRequest = async (req: Request, res: Response) => {
  try {
    const providerId = (req as any).user.id;
    const { id } = req.params;
    const request = await prisma.serviceRequest.findFirst({
      where: { id: Number(id), providerId },
      include: { serviceType: true },
    });
    if (!request) return res.status(400).json("Request not found");

    await prisma.serviceRequest.updateMany({
      where: { id: Number(id), providerId, status: "APPROVED" },
      data: { status: "IN_PROGRESS" ,
        inProgressAt: new Date()
      },
    });
    const adminId = await getAdminId();

    await prisma.notification.createMany({
      data: [
        {
          userId: request.farmerId,
          title: "Service Completed",
          message: `Your ${request.serviceType.name} service #${request.id} is in progress!`,
        },
        {
          userId: adminId!,
          title: "Service Completed",
          message: `${request.serviceType.name} request #${request.id} is in progress by provider.`,
        },
      ],
    });

    return res.status(200).json("Request in progress");
  } catch (err: any) {
    logger.error("Unable to change status");
    return res.status(500).json("Cannot change the status");
  }
};

const rejectRequest = async (req: Request, res: Response) => {
  try {
    const providerId = (req as any).user.id;
    const { id } = req.params;

    await prisma.serviceRequest.updateMany({
      where: { id: Number(id), providerId, status: "ASSIGNED" },
      data: {
        status: "REJECTED",
      },
    });

    return res.status(200).json("Request rejected");
  } catch (err: any) {
    logger.error("Unable to reject the request", err);
    return res.status(500).json("Request not rejected");
  }
};

const completedRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = (req as any).user.id;
    const request = await prisma.serviceRequest.findFirst({
      where: { id: Number(id), providerId },
      include: { serviceType: true },
    });
    if (!request) return res.status(400).json("Request not found");

    await prisma.serviceRequest.updateMany({
      where: {
        id: Number(id),
        providerId,
        status: "IN_PROGRESS",
      },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
    const adminId = await getAdminId();

    await prisma.notification.createMany({
      data: [
        {
          userId: request.farmerId,
          title: "Service Completed",
          message: `Your ${request.serviceType.name} service #${request.id} has been completed!`,
        },
        {
          userId: adminId!,
          title: "Service Completed",
          message: `${request.serviceType.name} request #${request.id} has been completed by provider.`,
        },
      ],
    });
    return res.status(200).json("Request completed");
  } catch (err: any) {
    logger.error("Unable to change status to completed");
    return res.status(500).json("Request not completed");
  }
};

const addLog = async (req: Request, res: Response) => {
  try {
    const providerId = (req as any).user.id;
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "Note is required" });
    }

    const job = await prisma.serviceRequest.findFirst({
      where: { id: Number(id), providerId },
      include: { serviceType: true },
    });
    if (!job) return res.status(400).json({ error: "Job not found" });

    await prisma.serviceLog.create({
      data: { serviceRequestId: Number(id), providerId, note: note.trim() },
    });

    const adminId = await getAdminId();
    await prisma.notification.create({
      data: {
        userId: adminId!,
        title: "Progress Note Added",
        message: `New note on ${job.serviceType.name} request #${id}: "${note.trim().substring(0, 50)}"`,
      },
    });

    return res.status(200).json({ message: "Log added successfully" });
  } catch (err: any) {
    logger.error("Add log error:", err);
    return res.status(500).json({ error: "Failed to add log" });
  }
};


export default { listAssignedRequest, approvedRequest, inprogressRequest, rejectRequest, completedRequest, addLog
};
