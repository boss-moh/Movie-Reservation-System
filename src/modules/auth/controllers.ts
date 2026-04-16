import { Request, Response } from 'express';
import * as AuthService from './services';
import { RequestWithUser } from '@/types';


export const registerController = async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);

};

export const loginController = async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);

};

export const refreshTokenController = async (req: RequestWithUser, res: Response) => {
    const { refreshToken = '' } = req.body
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.status(200).json(result);
};