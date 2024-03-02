import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { UUIDType } from './uuid.js';
import { TProfile } from './profile.js';
import { TPost } from './post.js';
import { PrismaClient } from '@prisma/client';
type obj = {
    id: string
}
export const TUser: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: UUIDType },
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
        profile: { type: TProfile },
        posts: {
            type: new GraphQLList(TPost),
            resolve: async ({ id }: obj, _, context: PrismaClient) => {
                return await context.post.findMany({ where: { authorId: id } })
            }
        },
        userSubscribedTo: { type: new GraphQLList(TUser) },
        subscribedToUser: { type: new GraphQLList(TUser) },
    }),
});
