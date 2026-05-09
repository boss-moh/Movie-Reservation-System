import app from "@/app";
import request from "supertest";

import { getHashPassword } from "@/utils";
import { Role } from "@generated/prisma/enums";
import { prismaMock } from "@/test";
import { User } from "@generated/prisma/client";

const validUUID = "123e4567-e89b-12d3-a456-426614174000";
const invalidUUID = "not-a-uuid";

const clientAdmin = {
    id: "admin-1",
    name: "Admin",
    email: "admin@test.com",
    password: "adminpassword",
};

const DBAdmin: User = {
    ...clientAdmin,
    role: Role.ADMIN,
    hashPassword: "",
    keyForHashing: "",
    createdAt: new Date(),
    deletedAt: null,
    isDeleted: false,
};

const clientUser = {
    id: "user-1",
    name: "User",
    email: "user@test.com",
    password: "userpassword",
};

const DBUser: User = {
    ...clientUser,
    role: Role.USER,
    hashPassword: "",
    keyForHashing: "",
    createdAt: new Date(),
    deletedAt: null,
    isDeleted: false,

};




async function getAuthToken(userLogin: { email: string, password: string }, userDB: User) {
    prismaMock.user.findUnique.mockResolvedValueOnce({
        ...userDB,
        hashPassword: await getHashPassword(userLogin.password),
    });
    const res = await request(app).post("/api/auth/login").send(userLogin);
    return res.body.accessToken;
}


const getTokenUser = async () => await getAuthToken(clientUser, DBUser);

const getTokenAdmin = async () => await getAuthToken(clientAdmin, DBAdmin);

const helpers = {
    clientAdmin,
    DBAdmin,
    clientUser,
    DBUser,
    getAuthToken,
    getTokenAdmin,
    getTokenUser,
    validUUID,
    invalidUUID
}

export { helpers }