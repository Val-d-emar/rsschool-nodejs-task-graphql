import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { TProfile } from './profile.js';
import { TPost } from './post.js';
import { UUID } from 'node:crypto';
import { TContext } from './loader.js';
import DataLoader from 'dataloader';

type obj = { id: UUID };

export const TUser: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: TProfile,
      resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
        if (loaders.profile === undefined) {
          loaders.profile = new DataLoader(async (ids) => {
            const res = await prisma.profile.findMany({
              where: { userId: { in: ids as UUID[] } },
            });
            return ids.map((id) => res.find((r) => r.userId === id));
          });
        }
        return await loaders.profile.load(id);
      },
    },
    posts: {
      type: new GraphQLList(TPost),
      resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
        if (loaders.posts === undefined) {
          loaders.posts = new DataLoader(async (ids) => {
            const res = await prisma.post.findMany({
              where: { authorId: { in: ids as UUID[] } },
            });
            return ids.map((id) => res.filter((r) => r.authorId === id));
          });
        }
        return await loaders.posts.load(id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(TUser),
      resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
        if (loaders.users2sub === undefined) {
          loaders.users2sub = new DataLoader(async (ids) => {
            const res = await prisma.subscribersOnAuthors.findMany({
              where: { subscriberId: { in: ids as UUID[] } },
              include: { author: true },
            });
            return ids.map((id) =>
              res.filter((r) => r.subscriberId === id).map((r) => r.author),
            );
          });
        }
        return await loaders.users2sub.load(id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(TUser),
      resolve: async ({ id }: obj, _, { prisma, loaders }: TContext) => {
        if (loaders.subs2user === undefined) {
          loaders.subs2user = new DataLoader(async (ids) => {
            const res = await prisma.subscribersOnAuthors.findMany({
              where: { authorId: { in: ids as UUID[] } },
              include: { subscriber: true },
            });
            return ids.map((id) =>
              res.filter((r) => r.authorId === id).map((r) => r.subscriber),
            );
          });
        }
        return await loaders.subs2user.load(id);
      },
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
};

export const TUserUpd = {
  type: new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: () => ({
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },
    }),
  }),
};
