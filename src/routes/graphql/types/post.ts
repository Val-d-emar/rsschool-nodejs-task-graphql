import { GraphQLObjectType, GraphQLString } from "graphql";
import { UUIDType } from "./uuid.js";
import { TUser } from "./user.js";
import { PrismaClient } from "@prisma/client";

type obj = { authorId: string }

export const TPost: GraphQLObjectType = new GraphQLObjectType({
    name: "Post",
    fields: () => ({
        id: { type: UUIDType },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        authorId: { type: UUIDType },
        author: {
            type: TUser,
            resolve: async ({ authorId }: obj, _, context: PrismaClient) => {
                return await context.user.findFirst({ where: { id: authorId } });
            },
        },
    }),
});
