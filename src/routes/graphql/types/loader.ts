import { MemberType, Post, PrismaClient, Profile, SubscribersOnAuthors, User } from "@prisma/client";
import DataLoader from "dataloader";

export type TContext = {
    prisma: PrismaClient,
    loaders: {
        user: DataLoader<string, User | undefined>,
        users2sub: DataLoader<string, User[] | undefined>,
        post: DataLoader<string, Post | undefined>,
        posts: DataLoader<string, Post[] | undefined>,
        profile: DataLoader<string, Profile | undefined>,
        member: DataLoader<string, MemberType | undefined>,
        subs2user: DataLoader<string, User[] | undefined>,
    }
}
