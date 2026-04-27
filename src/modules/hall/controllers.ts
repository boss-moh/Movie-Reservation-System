import { Request, Response } from "express";
import * as HallService from "./services";
import { RequestWithId } from "@/types";




export const createHallController = async (req: Request, res: Response) => {
  const hall = await HallService.createHall(req.body);
  res.status(201).json(hall);
};

export const getAllHallsController = async (_req: Request, res: Response) => {
  const halls = await HallService.getAllHalls();
  res.status(200).json(halls);
};

export const getHallByIdController = async (req: RequestWithId, res: Response) => {
  const hall = await HallService.getHallById(req.params.id);
  res.status(200).json(hall);
};

export const updateHallController = async (req: RequestWithId, res: Response) => {
  const hall = await HallService.updateHall(req.params.id, req.body);
  res.status(200).json(hall);
};

export const deleteHallController = async (req: RequestWithId, res: Response) => {
  const result = await HallService.deleteHall(req.params.id);
  res.status(200).json(result);
};

export const restoreHallController = async (req: RequestWithId, res: Response) => {
  const result = await HallService.restoreHall(req.params.id);
  res.status(200).json(result);
};


