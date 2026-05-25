import { Request, Response } from 'express';
import * as UserService from './services';
import { RequestWithID, ApiResponse, userDTO } from '@/types';

export const promoteController = async (req: Request, res: Response<ApiResponse<userDTO>>) => {
    const { role, id } = req.body;
    const updatedUser = await UserService.promoteToAdmin(id, role);
    res.status(200).json({
        response: {
            status: 200,
            data: updatedUser,
            message: 'User role updated successfully',
            success: true,
        },
    });
};


export const getAllUsersController = async (_req: Request, res: Response<ApiResponse<userDTO[]> >) => {
    const users = await UserService.getAllUsers();
    res.status(200).json({
        response: {
            status: 200,
            data: users,
            message: 'Users retrieved successfully',
            success: true,
        },
    });
};

export const getUserByIdController = async (req: RequestWithID, res: Response<ApiResponse<userDTO>>) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    res.status(200).json({
        response: {
            status: 200,
            data: user,
            message: 'User retrieved successfully',
            success: true,
        },
    });
};



export const restoreUserController = async (req: RequestWithID, res: Response<ApiResponse<userDTO>>) => {
    const { id } = req.params;
    const restoredUser = await UserService.restoreUser(id);
    res.status(200).json({
        response: {
            status: 200,
            data: restoredUser,
            message: 'User restored successfully',
            success: true,
        },
    });
};


export const deleteUserController = async (req: RequestWithID, res: Response<ApiResponse<userDTO>>) => {
    const { id } = req.params;
    const deletedUser = await UserService.deleteUser(id);
    res.status(200).json({
        response: {
            status: 200,
            data: deletedUser,
            message: 'User deleted successfully',
            success: true,
        },
    });
};

