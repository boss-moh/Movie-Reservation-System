import { Request } from "express";
import { User } from "./prisma/client";

export type userDTO = Pick<User, 'id' | 'email' | 'name' | 'role'>

export type RequestWithUser = Request & { user?: userDTO };

export type RequestWithId = Request & { params: { id: string } };


export type RequestWithID<Name extends string = 'id'> = Request & {
    params: { [K in Name]: string };
};
