//src/controllers/adminController.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../utils/logger";
import { createNotification } from "../utils/notify";


//service category crud

const createCategory = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await prisma.serviceCategory.create({ data });
    return res.status(200).json("Category created successfully");
  } catch (err: any) {
    logger.error("Unable to create category", err);
    return res.status(500).json("Category not created");
  }
};

const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { id: "asc" },
      include: { services: { select: { id: true, name: true } } }
    });
    return res.status(200).json(categories);
  } catch (err: any) {
    logger.error("Unable to list categories", err);
    return res.status(500).json("Categories not listed");
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body; 
    await prisma.serviceCategory.update({
      where: { id: Number(id) },
      data: { name }
    });
    return res.status(200).json("Category updated successfully");
  } catch (err: any) {
    logger.error("Unable to update category", err);
    return res.status(500).json("Category not updated");
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // First unlink all services from this category
    await prisma.serviceType.updateMany({
      where: { categoryId: Number(id) },
      data: { categoryId: null }
    });
    // Then delete the category
    await prisma.serviceCategory.delete({
      where: { id: Number(id) }
    });
    return res.status(200).json("Category deleted successfully");
  } catch (err: any) {
    logger.error("Unable to delete category", err);
    return res.status(500).json("Category not deleted");
  }
};

//service crud

const createService = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await prisma.serviceType.create({
      data,
    });
    return res.status(200).json("Service created successfully");
  } catch (err: any) {
    logger.error("Create service error:", err);
    return res.status(500).json("Unable to create service");
  }
};

//list services

const listServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.serviceType.findMany({});
    return res.status(200).json(services);
  } catch (err: any) {
    logger.error("Service not found error:", err);
    return res.status(500).json("Service not found");
  }
};

//get service by id

const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.serviceType.findFirst({
      where: { id: Number(id) },
    });

    if (!service) {
      return res.status(500).json({ error: "Service not found" });
    }

    return res.status(200).json(service);
  } catch (err: any) {
    logger.error("Get service by ID error:", err);
    return res.status(500).json({ error: "Failed to fetch service" });
  }
};
//update sevice

const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await prisma.serviceType.update({
      where: { id: Number(id) },
      data: data,
    });
    return res.status(200).json("Service updated sucesfully");
  } catch (err: any) {
    logger.error("Service not updated", err);
    return res.status(500).json("Service not updated");
  }
};

//delete service

const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.serviceType.delete({
      where: { id: Number(id) },
    });
    return res.status(200).json("Service deleted");
  } catch (err: any) {
    logger.error("Service not updated", err);
    return res.status(500).json("Service not updated");
  }
};

//user crud
//add users
const addUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const roleRecord = await prisma.role.findFirst({
      where: { name: data.role },
    });
    if (!roleRecord || roleRecord.name === "ADMIN") {
      return res.status(400).json("ONly farmers and providers can be added");
    }
    const existing = await prisma.user.findFirst({
      where: { mobile: data.mobile },
    });
    if (existing) {
      return res.status(400).json({ error: "Mobile already registered" });
    }
    data.roleId = roleRecord.id; // convert string role → number roleId
    delete data.role;

    await prisma.user.create({
      data,
    });
    return res.status(200).json("User created successfully");
  } catch (err: any) {
    logger.error("User not created", err);
    return res.status(500).json("Unable to create user");
  }
};

//update user

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await prisma.user.update({
      where: { id: Number(id) },
      data: data,
    });

    res.json({ message: "User updated" });
  } catch (err: any) {
    logger.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

//list users

const listUser = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      include: { role: true },
    });
    return res.status(200).json(users);
  } catch (err: any) {
    logger.error("Service status not updated", err);
    return res.status(500).json("Unable to list the users");
  }
};

//list farmer

const listFarmer = async (req: Request, res: Response) => {
  try {
    const farmers = await prisma.user.findMany({
      where: {
        role: { name: "FARMER" },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json(farmers);
  } catch (err: any) {
    logger.error("Unable to list farmers", err);
    return res.status(500).json("Farmers not listed");
  }
};
//list providers

const listProviders = async (req: Request, res: Response) => {
  try {
    const providers = await prisma.user.findMany({
      where: {
        role: { name: "PROVIDER" },
      },
      orderBy: { id: "desc" },
    });
    return res.status(200).json(providers);
  } catch (err: any) {
    logger.error("Unable to list providers", err);
    return res.status(500).json("Providers not listed");
  }
};

//delete user

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        id: Number(id),
      },
    });
    if (!user) {
      return res.status(400).json("User not found");
    }

    await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    return res.status(200).json("User deleted successfully");
  } catch (err: any) {
    logger.error("Unable to delete user", err);
    return res.status(500).json("Unable to delete the user");
  }
};

const assignProvider = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.body;
    const { id } = req.params;

    const request = await prisma.serviceRequest.update({
      where: { id: Number(id) },
      data: {
        providerId,
        status: "ASSIGNED",
        assignedAt: new Date(),
      },
      include: { farmer: true, serviceType: true },
    });
    await prisma.notification.createMany({
      data: [
        {
          userId: request.farmerId,
          title: "Request Assigned",
          message: `Your ${request.serviceType.name} request #${request.id} has been assigned to a provider.`,
        },
        {
          userId: providerId,
          title: "New Job Assigned",
          message: `You have been assigned a new ${request.serviceType.name} job #${request.id}.`,
        },
      ],
    });

    return res.status(200).json("Provider has assigned");
  } catch (err: any) {
    logger.error("Unable to assign the provider", err);
    return res.status(500).json("Providers not assigned");
  }
};

const rejectRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await prisma.serviceRequest.update({
      where: { id: Number(id) },
      data: { status: "REJECTED" },
      include: { farmer: true, serviceType: true },
    });
    await createNotification(
      request.farmerId,
      "Request Rejected",
      `Your  ${request.serviceType.name} request has been rejected by admin.`,
    );
    return res.status(200).json("Request rejected");
  } catch (err: any) {
    logger.error("Unable to reject request", err);
    return res.status(500).json("Request not rejected");
  }
};
//list all service request
const listAllServiceRequest = async (req: Request, res: Response) => {
  try {
    const request = await prisma.serviceRequest.findMany({
      orderBy: { id: "desc" },
    });
    return res.status(200).json(request);
  } catch (err: any) {
    logger.error("Unable to list service request", err);
    return res.status(500).json("Service request not listed");
  }
};

//crud crop

//create crops

const createCrop = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await prisma.crop.create({
      data,
    });
    return res.status(200).json("Crop created successfully");
  } catch (err: any) {
    logger.error("Unable to create crop", err);
    return res.status(500).json("Crop not created");
  }
};

const updateCrop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await prisma.crop.update({
      where: { id: Number(id) },
      data: data,
    });
    return res.status(200).json("Crop updated successfully");
  } catch (err: any) {
    logger.error("Unable to update the crop", err);
    return res.status(500).json("Crop not updated");
  }
};

//list crops

const listCrop = async (req: Request, res: Response) => {
  try {
    const crop = await prisma.crop.findMany({
      orderBy: { id: "desc" },
    });
    return res.status(200).json(crop);
  } catch (err: any) {
    logger.error("Unable to list the crop", err);
    return res.status(500).json("Crop not listed");
  }
};

const listCropById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const crop = await prisma.crop.findFirst({
      where: {
        id: Number(id),
      },
    });
    return res.status(200).json(crop);
  } catch (err: any) {
    logger.error("Unable to list the crop", err);
    return res.status(500).json("Crop not listed");
  }
};

const deleteCrop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.crop.delete({
      where: { id: Number(id) },
    });
    return res.status(200).json("Crop deleted successfully");
  } catch (err: any) {
    logger.error("Unable to delete the crop", err);
    return res.status(500).json("Cannot delete the crop");
  }
};

const setPriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const request = await prisma.serviceRequest.update({
      where: { id: Number(id) },
      data: { priority },
      include: { serviceType: true },
    });

    if (request.providerId) {
      await createNotification(
        request.providerId,
        priority === "URGENT" ? "Job Marked URGENT" : "Job Priority Updated",
        `Your ${request.serviceType.name} job has been marked as ${priority}.`,
      );
    }

    return res.status(200).json("Priority updated");
  } catch (err: any) {
    logger.error("Unable to set priority", err);
    return res.status(500).json("Priority not updated");
  }
};

//get log by request
const getLogsByRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await prisma.serviceLog.findMany({
      where: { serviceRequestId: Number(id) },
      orderBy: { createdAt: "asc" },
      include: { provider: { select: { name: true, mobile: true } } },
    });
    return res.status(200).json(logs);
  } catch (err: any) {
    logger.error("Get logs error:", err);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
};
//get all logs

const getAllLogs = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      where: {
        status: {
          notIn: ["REJECTED"],
        },
      },
      orderBy: { id: "desc" },
      include: {
        serviceType: { select: { name: true } },
        farmer: { select: { name: true, mobile: true } },
        provider: { select: { name: true, mobile: true } },
        farm: { select: { name: true, address: true } },
        logs: {
          orderBy: { createdAt: "asc" },
          include: { provider: { select: { name: true } } },
        },
      },
    });
    return res.status(200).json(requests);
  } catch (err: any) {
    logger.error("Get all logs error:", err);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
};

export default {
  createCategory, listCategories, updateCategory, deleteCategory,
  createService, listServices, updateService, getServiceById, deleteService,
  addUser, listUser, listFarmer, listProviders, assignProvider, rejectRequest,
  updateUser, deleteUser, listAllServiceRequest, 
  createCrop, updateCrop, listCrop, listCropById, deleteCrop,
  setPriority, getLogsByRequest, getAllLogs
};
