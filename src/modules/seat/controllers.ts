import { Request, Response } from "express";
import * as SeatService from "./services";
import { RequestWithId, ApiResponse } from "@/types";
import { Seat } from "@generated/prisma/client";

export const createSeatController = async (req: Request, res: Response<ApiResponse<Seat>>) => {
  const seat = await SeatService.createSeat(req.body);
  res.status(201).json({
    response: {
      status: 201,
      data: seat,
      message: "Seat created successfully",
      success: true,
    },
  });
};

export const getAllSeatsController = async (_req: Request, res: Response<ApiResponse<Seat[]>>) => {
  const seats = await SeatService.getAllSeats();
  res.status(200).json({
    response: {
      status: 200,
      data: seats,
      message: "Seats retrieved successfully",
      success: true,
    },
  });
};

export const getSeatByIdController = async (req: RequestWithId, res: Response<ApiResponse<Seat>>) => {
  const { seatId } = req.params;
  const seat = await SeatService.getSeatById(seatId as string);
  res.status(200).json({
    response: {
      status: 200,
      data: seat,
      message: "Seat retrieved successfully",
      success: true,
    },
  });
};

export const getSeatsByHallIdController = async (req: RequestWithId, res: Response<ApiResponse<Seat[]>>) => {
  const { id } = req.params;
  const seats = await SeatService.getSeatsByHallId(id);
  res.status(200).json({
    response: {
      status: 200,
      data: seats,
      message: "Seats retrieved successfully",
      success: true,
    },
  });
};

export const updateSeatController = async (req: RequestWithId, res: Response<ApiResponse<Seat>>) => {
  const { seatId } = req.params;
  const updatedSeat = await SeatService.updateSeat(seatId as string, req.body);
  res.status(200).json({
    response: {
      status: 200,
      data: updatedSeat,
      message: "Seat updated successfully",
      success: true,
    },
  });
};

export const deleteSeatController = async (req: RequestWithId, res: Response<ApiResponse>) => {
  const { seatId } = req.params;
  await SeatService.deleteSeat(seatId as string);
  res.status(200).json({
    response: {
      status: 200,
      data: null,
      message: "Seat deleted successfully",
      success: true,
    },
  });
};

export const restoreSeatController = async (req: RequestWithId, res: Response<ApiResponse>) => {
  const { seatId } = req.params;
  await SeatService.restoreSeat(seatId as string);
  res.status(200).json({
    response: {
      status: 200,
      data: null,
      message: "Seat restored successfully",
      success: true,
    },
  });
};
