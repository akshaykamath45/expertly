import { PrismaClient } from "@prisma/client";

export const db = globalThis.prisma || new PrismaClient();

// to prevent hot reloading everytime in dev mode, if its production, it will create new PrismaClient only once
if (process.env.NODE_ENV != "production") {
  globalThis.prisma = db;
}
