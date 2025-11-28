import { PrismaClient } from "@prisma/client";
import config from "../prisma.config.js";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    datasources: config.datasources,
  });
} else {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient({
      datasources: config.datasources,
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prismaGlobal;
}

// Ensure the client is connected
prisma.$connect().catch((error: unknown) => {
  console.error("Failed to connect to database:", error);
});

export default prisma;
