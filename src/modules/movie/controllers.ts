import { Request, Response } from 'express';
import * as MovieService from './services';
import { RequestWithId } from '@/types';

export const createMovieController = async (req: Request, res: Response) => {
    const movie = await MovieService.createMovie(req.body);
    res.status(201).json(movie);
};

export const getAllMoviesController = async (req: Request, res: Response) => {
    const movies = await MovieService.getAllMovies();
    res.status(200).json(movies);
};

export const getMovieByIdController = async (req: RequestWithId, res: Response) => {
    const { id } = req.params;
    const movie = await MovieService.getMovieById(id);
    res.status(200).json(movie);
};

export const updateMovieController = async (req: RequestWithId, res: Response) => {
    const { id } = req.params
    const updatedMovie = await MovieService.updateMovie(id, req.body);
    res.status(200).json(updatedMovie);
};

export const deleteMovieController = async (req: RequestWithId, res: Response) => {
    const { id } = req.params
    const result = await MovieService.deleteMovie(id);
    res.status(200).json(result);
};


export const restoreMovieController = async (req: RequestWithId, res: Response) => {
    const { id } = req.params
    const result = await MovieService.restoreMovie(id);
    res.status(200).json(result);
};