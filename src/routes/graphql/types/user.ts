import { GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, subscribe } from 'graphql';

import { UUIDType } from './uuid.js';
import { TProfile } from './profile.js';
import { TPost } from './post.js';
import { UUID } from 'node:crypto';
import { TContext } from './loader.js';
import DataLoader from 'dataloader';
type obj = { id: UUID }
export const TUser: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: UUIDType },
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
        profile: {
            type: TProfile,
            // resolve: async ({ id }: obj, _, { prisma }: TContext) => {
            //     return await prisma.profile.findFirst({ where: { userId: id } });
            // },
            resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
                if (loaders.profile === undefined) {
                    loaders.profile = new DataLoader(async (ids) => {
                        const res = await prisma.profile.findMany({ where: { userId: { in: ids as UUID[] } } });
                        return ids.map((id) => res.find((r) => r.userId === id));
                    });
                }
                return await loaders.profile.load(id);
            },
        },
        posts: {
            type: new GraphQLList(TPost),
            // resolve: async ({ id }: obj, _, { prisma }: TContext) => {
            //     return await prisma.post.findMany({ where: { authorId: id } });
            // }
            resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
                if (loaders.posts === undefined) {
                    loaders.posts = new DataLoader(async (ids) => {
                        const res = await prisma.post.findMany({ where: { authorId: { in: ids as UUID[] } } });
                        return ids.map((id) => res.filter((r) => r.authorId === id));
                    });
                }
                return await loaders.posts.load(id);
            },
        },
        userSubscribedTo: {
            type: new GraphQLList(TUser),
            resolve: async ({ id }: obj, _, { prisma }: TContext) => {
                const sub = await prisma.subscribersOnAuthors.findMany({
                    where: {
                        subscriberId: id,
                    },
                    select: {
                        author: true,
                    },
                });
                return sub.map(({ author }) => author);
            }
            // resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
            //     if (loaders.users2sub === undefined) {
            //         loaders.users2sub = new DataLoader(async (ids) => {
            //             const res = await prisma.subscribersOnAuthors.findMany({
            //                 where: {
            //                     subscriberId: { in: ids as UUID[] },
            //                 },
            //                 // include: {
            //                 //     author: true,
            //                 // },
            //             });
            //             const res2 = res.map(({ authorId }) => authorId);
            //             const res3 = await prisma.user.findMany({
            //                 where: {
            //                     id: { in: res2 as UUID[] },
            //                 },
            //                 // include: {
            //                 //     author: true,
            //                 // },
            //             });                        
            //             return ids.map(() => res3);
            //             // return ids.map((id) => res.filter((r) => r.subscriberId === id));
            //         });
            //     }
            //     return await loaders.users2sub.load(id);
            // },
            // resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
            //     if (loaders.users2sub === undefined) {
            //         loaders.users2sub = new DataLoader(async (ids) => {
            //             const res = await prisma.user.findMany({
            //                 where: {
            //                     subscribedToUser: {
            //                         some: {
            //                             subscriberId: { in: ids as UUID[] },
            //                         },
            //                     },
            //                 },
            //             });
            //             return ids.map((id) => res.filter((r) => r.id === id));
            //         });
            //     }
            //     return await loaders.users2sub.load(id);
            // },
        },
        subscribedToUser: {
            type: new GraphQLList(TUser),
            resolve: async ({ id }: obj, _, { prisma }: TContext) => {
                const sub = await prisma.subscribersOnAuthors.findMany({
                    where: {
                        authorId: id,
                    },
                    select: {
                        subscriber: true,
                    },
                });
                return sub.map(({ subscriber }) => subscriber);
            }
            // resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
            //     if (loaders.subs2user === undefined) {
            //         loaders.subs2user = new DataLoader(async (ids) => {
            //             const res = await prisma.subscribersOnAuthors.findMany({
            //                 where: {
            //                     authorId: { in: ids as UUID[] },
            //                 },
            //                 select: {
            //                     subscriber: true,
            //                 },
            //             });
            //             return ids.map(() => res.map(({ subscriber }) => subscriber));
            //         });
            //     }
            //     return await loaders.subs2user.load(id);
            // resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
            //     if (loaders.subs2user === undefined) {
            //         loaders.subs2user = new DataLoader(async (ids) => {
            //             const res = await prisma.user.findMany({
            //                 where: {
            //                     userSubscribedTo: {
            //                         some: {
            //                             authorId: { in: ids as UUID[] },
            //                         },
            //                     },
            //                 },
            //             });
            //             return ids.map((id) => res.filter((r) => r.id === id));
            //         });
            //     }
            //     return await loaders.subs2user.load(id);
            // },
        },
    }),
});
export const TUserAdd = {
    type: new GraphQLInputObjectType({
        name: 'CreateUserInput',
        fields: () => ({
            name: { type: new GraphQLNonNull(GraphQLString) },
            balance: { type: new GraphQLNonNull(GraphQLFloat) },
        }),
    }),
}
export const TUserUpd = {
    type: new GraphQLInputObjectType({
        name: 'ChangeUserInput',
        fields: () => ({
            name: { type: GraphQLString },
            balance: { type: GraphQLFloat },
        }),
    }),
}
