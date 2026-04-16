import { User } from "@generated/prisma/client";

export const getUserDTO = (user: User) => {
    const { id, name, email, role } = user;
    return { id, name, email, role };
}



export const getUserWithoutPassword = (user: User) => {
    const { id, name, email, role, isDeleted, deletedAt, createdAt } = user;
    return { id, name, email, role, isDeleted, deletedAt, createdAt };
}
