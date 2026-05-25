import { Request, Response } from 'express';
import * as AuthService from '@/modules/auth/services';
import { RequestWithUser, ApiResponse, userDTO } from '@/types';
import { accessToken, AuthResponseDTO } from '@/modules/auth/type';


export const registerController = async (req: Request, res: Response<ApiResponse<userDTO>>) => {
    const user = await AuthService.register(req.body);
    res.status(201).json({
        response: {
            status: 201,
            message: 'User registered successfully',
            success: true,
            data: user,
        },
    });

};

export const loginController = async (req: Request, res: Response<ApiResponse<AuthResponseDTO>>) => {
    const result = await AuthService.login(req.body);
    res.status(200).json({
        response: {
            status: 200,
            data: result,
            message: 'Login successful',
            success: true,
        },
    });

};

export const refreshTokenController = async (req: RequestWithUser, res: Response<ApiResponse<accessToken>>) => {
    const { refreshToken = '' } = req.body
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.status(200).json({
        response: {
            status: 200,
            data: result,
            message: 'Token refreshed successfully',
            success: true,
        },
    });
};