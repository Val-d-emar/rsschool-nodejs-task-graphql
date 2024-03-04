import { MemberType, Post, PrismaClient, Profile, User } from "@prisma/client";
import DataLoader from "dataloader";

export type TContext = {
    prisma: PrismaClient,
    // loaders: Map<string,DataLoader<string, User>>,
    loaders: {
        user : DataLoader<string, User | undefined>,
        post : DataLoader<string, Post | undefined>,
        profile: DataLoader<string, Profile | undefined>,
        member: DataLoader<string, MemberType | undefined>,
    }
  }
