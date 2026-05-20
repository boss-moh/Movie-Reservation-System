import { Request, Response } from "express";
import * as ShowtimeService from "@/modules/showtime/services";
import { RequestWithId } from "@/types";

export const createShowtimeController = async (req: Request, res: Response) => {
  const showtime = await ShowtimeService.createShowtime(req.body);
  res.status(201).json(showtime);
};

export const getAllShowtimesController = async (req: Request, res: Response) => {
  const { movieId, hallId, from, to } = req.query;
  const filters: { movieId?: string; hallId?: string; from?: string; to?: string } = {};
  if (movieId) filters.movieId = movieId as string;
  if (hallId) filters.hallId = hallId as string;
  if (from) filters.from = from as string;
  if (to) filters.to = to as string;
  const showtimes = await ShowtimeService.getAllShowtimes(filters);
  res.status(200).json(showtimes);
};

export const getShowtimeByIdController = async (req: RequestWithId, res: Response) => {
  const showtime = await ShowtimeService.getShowtimeById(req.params.id);
  res.status(200).json(showtime);
};

export const updateShowtimeController = async (req: RequestWithId, res: Response) => {
  const showtime = await ShowtimeService.updateShowtime(req.params.id, req.body);
  res.status(200).json(showtime);
};

export const deleteShowtimeController = async (req: RequestWithId, res: Response) => {
  const result = await ShowtimeService.deleteShowtime(req.params.id);
  res.status(200).json(result);
};

export const restoreShowtimeController = async (req: RequestWithId, res: Response) => {
  const result = await ShowtimeService.restoreShowtime(req.params.id);
  res.status(200).json(result);
};



export const getFreeSlotsController = async (req: RequestWithId, res: Response) => {
  const { hallId } = req.body
  const { date } = req.query;
  const slots = await ShowtimeService.getFreeSlots(hallId, date as string);
  res.status(200).json(slots);
};



export const getOccupiedSlotsController = async (req: RequestWithId, res: Response) => {
  const { hallId } = req.body
  const { date } = req.query;
  const slots = await ShowtimeService.getOccupiedSlots(hallId, date as string);
  res.status(200).json(slots);
};