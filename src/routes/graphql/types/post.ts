import { GraphQLInputObjectType, GraphQLObjectType, GraphQLString } from "graphql";
import { UUIDType } from "./uuid.js";
import { TUser } from "./user.js";
import { TContext } from "./loader.js";

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
            resolve: async ({ authorId }: obj, _, { prisma }: TContext) => {
                return await prisma.user.findFirst({ where: { id: authorId } });
            },
        },
    }),
});

export const TPostAdd = {
    type: new GraphQLInputObjectType({
        name: "CreatePostInput",
        fields: () => ({
            id: { type: UUIDType },
            title: { type: GraphQLString },
            content: { type: GraphQLString },
            authorId: { type: UUIDType },
        }),
    })
}

export const TPostUpd = {
    type: new GraphQLInputObjectType({
        name: "ChangePostInput",
        fields: () => ({
            title: { type: GraphQLString },
            content: { type: GraphQLString },
            authorId: { type: UUIDType },
        }),
    })
}
