import { Request, Response } from 'express';
import * as MovieService from './services';
import { RequestWithId, ApiResponse } from '@/types';
import { Movie } from '@generated/prisma/client';

export const createMovieController = async (req: Request, res: Response<ApiResponse<Movie>>) => {
    const movie = await MovieService.createMovie(req.body);
    res.status(201).json({
        response: {
            status: 201,
            data: movie,
            message: 'Movie created successfully',
            success: true,
        },
    });
};

export const getAllMoviesController = async (_req: Request, res: Response<ApiResponse<Movie[]>>) => {
    const movies = await MovieService.getAllMovies();
    res.status(200).json({
        response: {
            status: 200,
            data: movies,
            message: 'Movies retrieved successfully',
            success: true,
        },
    });
};

export const getMovieByIdController = async (req: RequestWithId, res: Response<ApiResponse<Movie>>) => {
    const { id } = req.params;
    const movie = await MovieService.getMovieById(id);
    res.status(200).json({
        response: {
            status: 200,
            data: movie,
            message: 'Movie retrieved successfully',
            success: true,
        },
    });
};

export const updateMovieController = async (req: RequestWithId, res: Response<ApiResponse<Movie>>) => {
    const { id } = req.params
    const updatedMovie = await MovieService.updateMovie(id, req.body);
    res.status(200).json({
        response: {
            status: 200,
            data: updatedMovie,
            message: 'Movie updated successfully',
            success: true,
        },
    });
};

export const deleteMovieController = async (req: RequestWithId, res: Response<ApiResponse>) => {
    const { id } = req.params
    await MovieService.deleteMovie(id);
    res.status(200).json({
        response: {
            status: 200,
            data: null,
            message: 'Movie deleted successfully',
            success: true,
        },
    });
};


export const restoreMovieController = async (req: RequestWithId, res: Response<ApiResponse>) => {
    const { id } = req.params
    await MovieService.restoreMovie(id);
    res.status(200).json({
        response: {
            status: 200,
            data: null,
            message: 'Movie restored successfully',
            success: true,
        },
    });
};