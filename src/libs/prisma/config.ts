import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@generated/prisma/client"; 
import { URL } from "@/config";



const adapter = new PrismaPg({ connectionString:URL });
const prisma = new PrismaClient({ adapter });

export { prisma };

export default prisma;