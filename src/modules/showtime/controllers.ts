import { Request, Response } from "express";
import * as ShowtimeService from "@/modules/showtime/services";
import { RequestWithId, ApiResponse } from "@/types";
import { Showtime } from "@generated/prisma/client";
import { FreeSlot, Slot } from "./type";

export const createShowtimeController = async (req: Request, res: Response<ApiResponse<Showtime>>) => {
  const showtime = await ShowtimeService.createShowtime(req.body);
  res.status(201).json({
    response: {
      status: 201,
      data: showtime,
      message: 'Showtime created successfully',
      success: true,
    },
  });
};

export const getAllShowtimesController = async (req: Request, res: Response<ApiResponse<Showtime[]>>) => {
  const { movieId, hallId, from, to } = req.query;
  const filters: { movieId?: string; hallId?: string; from?: string; to?: string } = {};
  if (movieId) filters.movieId = movieId as string;
  if (hallId) filters.hallId = hallId as string;
  if (from) filters.from = from as string;
  if (to) filters.to = to as string;
  const showtimes = await ShowtimeService.getAllShowtimes(filters);
  res.status(200).json({
    response: {
      status: 200,
      data: showtimes,
      message: 'Showtimes retrieved successfully',
      success: true,
    },
  });
};

export const getShowtimeByIdController = async (req: RequestWithId, res: Response<ApiResponse<Showtime>>) => {
  const showtime = await ShowtimeService.getShowtimeById(req.params.id);
  res.status(200).json({
    response: {
      status: 200,
      data: showtime,
      message: 'Showtime retrieved successfully',
      success: true,
    },
  });
};

export const updateShowtimeController = async (req: RequestWithId, res: Response<ApiResponse<Showtime>>) => {
  const showtime = await ShowtimeService.updateShowtime(req.params.id, req.body);
  res.status(200).json({
    response: {
      status: 200,
      data: showtime,
      message: 'Showtime updated successfully',
      success: true,
    },
  });
};

export const deleteShowtimeController = async (req: RequestWithId, res: Response<ApiResponse<Showtime>>) => {
  const result = await ShowtimeService.deleteShowtime(req.params.id);
  res.status(200).json({
    response: {
      status: 200,
      data: result,
      message: 'Showtime deleted successfully',
      success: true,
    },
  });
};

export const restoreShowtimeController = async (req: RequestWithId, res: Response<ApiResponse<Showtime>>) => {
  const result = await ShowtimeService.restoreShowtime(req.params.id);
  res.status(200).json({
    response: {
      status: 200,
      data: result,
      message: 'Showtime restored successfully',
      success: true,
    },
  });
};



export const getFreeSlotsController = async (req: RequestWithId, res: Response<ApiResponse<FreeSlot[]>>) => {
  const { hallId } = req.body
  const { date } = req.query;
  const slots = await ShowtimeService.getFreeSlots(hallId, date as string);
  res.status(200).json({
    response: {
      status: 200,
      data: slots,
      message: 'Free slots retrieved successfully',
      success: true,
    },
  });
};



      export const getOccupiedSlotsController = async (req: RequestWithId, res: Response<ApiResponse<Slot[]>>) => {
  const { hallId } = req.body
  const { date } = req.query;
  const slots = await ShowtimeService.getOccupiedSlots(hallId, date as string);
  res.status(200).json({
    response: {
      status: 200,
      data: slots,
      message: 'Occupied slots retrieved successfully',
      success: true,
    },
  });
};