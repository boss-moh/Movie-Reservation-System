import { Request, Response } from 'express';
import * as UserService from './services';
import { RequestWithID } from '@/types';

export const promoteController = async (req: Request, res: Response) => {
    const { role, id } = req.body;
    const updatedUser = await UserService.promoteToAdmin(id, role);
    res.status(200).json(updatedUser);
};


export const getAllUsersController = async (_req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
};

export const getUserByIdController = async (req: RequestWithID, res: Response) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    res.status(200).json(user);
};



export const restoreUserController = async (req: RequestWithID, res: Response) => {
    const { id } = req.params;
    const restoredUser = await UserService.restoreUser(id);
    res.status(200).json(restoredUser);
};


export const deleteUserController = async (req: RequestWithID, res: Response) => {
    const { id } = req.params;
    const deletedUser = await UserService.deleteUser(id);
    res.status(200).json(deletedUser);
};

