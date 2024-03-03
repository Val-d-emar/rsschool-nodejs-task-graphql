import { Type } from '@fastify/type-provider-typebox';
import { GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { TUser } from './types/user.js';
import { PrismaClient } from '@prisma/client';
import { TPost } from './types/post.js';
import { UUIDType } from './types/uuid.js';
import { TProfile } from './types/profile.js';
import { TMemberType, TMemberTypeId } from './types/membertype.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

type obj = {
  id: string
}
const uid = {
  type: UUIDType
}
const mid = {
  type: TMemberTypeId
}

export const createGqlQuerySchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new GraphQLList(TUser),
        resolve: async (_, __, context: PrismaClient) => {
          return await context.user.findMany();
        },
      },
      posts: {
        type: new GraphQLList(TPost),
        resolve: async (_, __, context: PrismaClient) => {
          return await context.post.findMany();
        },
      },
      profiles: {
        type: new GraphQLList(TProfile),
        resolve: async (_, __, context: PrismaClient) => {
          return await context.profile.findMany();
        },
      },
      memberTypes: {
        type: new GraphQLList(TMemberType),
        resolve: async (_, __, context: PrismaClient) => {
          return await context.memberType.findMany();
        },
      },
      user: {
        type: TUser,
        args: { id: uid },
        resolve: async (_, { id }: obj, context: PrismaClient) => {
          return await context.user.findFirst({ where: { id } });
        },
      },
      post: {
        type: TPost,
        args: { id: uid },
        resolve: async (_, { id }: obj, context: PrismaClient) => {
          return await context.post.findFirst({ where: { id } });
        },
      },
      profile: {
        type: TProfile,
        args: { id: uid },
        resolve: async (_, { id }: obj, context: PrismaClient) => {
          return await context.profile.findFirst({ where: { id } });
        },
      },
      memberType: {
        type: TMemberType,
        args: { id: mid },
        resolve: async (_, { id }: obj, context: PrismaClient) => {
          return await context.memberType.findFirst({ where: { id } });
        },
      },
    },
  }),
});

