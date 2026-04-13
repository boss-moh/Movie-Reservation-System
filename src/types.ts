import { Request } from "express";
import { User } from "./prisma/client";

export type userDTO = Pick<User,'id'|'email'|'name'|'role'>

export type RequestWithUser = Request & { user?: userDTO };
