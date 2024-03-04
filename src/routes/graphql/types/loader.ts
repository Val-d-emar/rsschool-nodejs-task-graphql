import { PrismaClient, User } from "@prisma/client";
import DataLoader from "dataloader";

export type TContext = {
    prisma: PrismaClient,
    // loaders: Map<string,DataLoader<string, User>>,
    loaders: {
        user : DataLoader<string, User | undefined>
    }
  }

