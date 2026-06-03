import { Response } from "express";
import * as ReservationService from "./services";
import { ApiResponse, RequestWithID, RequestWithUser } from "@/types";
import { CreateReservationDTO, SingleReservation } from "./type";

export const createReservationController = async (
  req: RequestWithUser,
  res: Response<ApiResponse<SingleReservation>>,
) => {
  const data = req.body as CreateReservationDTO;
  const user = req.user!;
  console.log(user)

  const reservation = await ReservationService.createReservation(data, user.id);

  res.status(201).json({
    response: {
      status: 201,
      data: reservation,
      message: "Reservation created successfully",
      success: true,
    },
  });
};

export const getAllReservationsController = async (
  req: RequestWithUser,
  res: Response<ApiResponse<SingleReservation[]>>,
) => {
  const user = req.user!;
  const reservations = await ReservationService.getAllReservations(user.id, user.role === "ADMIN");

  res.status(200).json({
    response: {
      status: 200,
      data: reservations,
      message: "Reservations retrieved successfully",
      success: true,
    },
  });
};

export const getReservationByIdController = async (
  req: RequestWithID,
  res: Response<ApiResponse<SingleReservation>>,
) => {
  const user = (req as RequestWithUser).user!;
  const { id } = req.params;

  const reservation = await ReservationService.getReservationById(id, user.id, user.role === "ADMIN");

  res.status(200).json({
    response: {
      status: 200,
      data: reservation,
      message: "Reservation retrieved successfully",
      success: true,
    },
  });
};

export const cancelReservationController = async (
  req: RequestWithID,
  res: Response<ApiResponse<SingleReservation>>,
) => {
  const user = (req as RequestWithUser).user!;
  const { id } = req.params;

  const reservation = await ReservationService.cancelReservation(id, user.id, user.role === "ADMIN");

  res.status(200).json({
    response: {
      status: 200,
      data: reservation,
      message: "Reservation cancelled successfully",
      success: true,
    },
  });
};
