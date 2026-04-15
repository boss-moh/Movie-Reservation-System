import { Request, Response } from 'express';
import * as AuthService from './services';
import { RequestWithID, RequestWithUser } from '@/types';


export const registerController = async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);

};

export const loginController = async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);

};

export const promoteController = async (req: Request, res: Response) => {
    const { role, id } = req.body;
    const updatedUser = await AuthService.promoteToAdmin(id, role);
    res.status(200).json(updatedUser);
};


export const refreshTokenController = async (req: RequestWithUser, res: Response) => {
    const { refreshToken = '' } = req.body
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
};

export const deleteUserController = async (req: RequestWithID, res: Response) => {
    const { id } = req.params;
    const deletedUser = await AuthService.deleteUser(id);
    res.status(200).json(deletedUser);
};

export const restoreUserController = async (req: RequestWithID, res: Response) => {
    const { id } = req.params;
    const restoredUser = await AuthService.restoreUser(id);
    res.status(200).json(restoredUser);
};

export const getAllUsersController = async (req: Request, res: Response) => {
    const users = await AuthService.getAllUsers();
    res.status(200).json(users);
};

export const getUserByIdController = async (req: RequestWithID, res: Response) => {
    const { id } = req.params;
    const user = await AuthService.getUserById(id);
    res.status(200).json(user);
};