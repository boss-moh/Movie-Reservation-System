import { Request, Response } from "express";
import * as HallService from "@/modules/hall/services";
import { RequestWithId, ApiResponse } from "@/types";
import { HallWithSeats, UpdateHallDTO } from "./type";




export const createHallController = async (req: Request, res: Response<ApiResponse<HallWithSeats>>) => {
  const hall = await HallService.createHall(req.body);
  res.status(201).json({
    response: {
      status: 201,
      data: hall,
      message: 'Hall created successfully',
      success: true,
    },
  });
};

export const getAllHallsController = async (_req: Request, res: Response<ApiResponse<HallWithSeats[]>>) => {
  const halls = await HallService.getAllHalls();
  res.status(200).json({
    response: {
      status: 200,
      data: halls,
      message: 'Halls retrieved successfully',
      success: true,
    },
  });
};

export const getHallByIdController = async (req: RequestWithId, res: Response<ApiResponse<HallWithSeats>>) => {
  const hall = await HallService.getHallById(req.params.id);
  res.status(200).json({
    response: {
      status: 200,
      data: hall,
      message: 'Hall retrieved successfully',
      success: true,
    },
  });
};

export const updateHallController = async (req: RequestWithId, res: Response<ApiResponse<UpdateHallDTO>>) => {
  const hall = await HallService.updateHall(req.params.id, req.body);
  res.status(200).json({
    response: {
      status: 200,
      data: hall,
      message: 'Hall updated successfully',
      success: true,
    },
  });
};

