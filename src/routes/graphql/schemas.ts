import { Type } from '@fastify/type-provider-typebox';
import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { TUser, TUserAdd } from './types/user.js';
import { PrismaClient } from '@prisma/client';
import { TPost, TPostAdd } from './types/post.js';
import { UUIDType } from './types/uuid.js';
import { TProfile, TProfileAdd } from './types/profile.js';
import { TMemberType, TMemberTypeId } from './types/membertype.js';
import { userFields } from '../users/schemas.js';
import { MemberTypeId } from '../member-types/schemas.js';
import { UUID } from 'node:crypto';


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
  id: UUID,
  dto: {
    name: string;
    balance: number;
    authorId: UUID;
    title: string;
    content: string;
    userId: UUID;
    memberTypeId: MemberTypeId;
    isMale: boolean;
    yearOfBirth: number;
  };
}
type objm = {
  id: MemberTypeId,
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
        type: new GraphQLNonNull(TMemberType),
        args: { id: mid },
        resolve: async (_, { id }: objm, context: PrismaClient) => {
          return await context.memberType.findFirst({ where: { id } });
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: TUser,
        args: { dto: TUserAdd },
        resolve: async (_, { dto }: obj, context: PrismaClient) => {
          return await context.user.create({ data: dto });
        },
      },
      createPost: {
        type: TPost,
        args: { dto: TPostAdd },
        resolve: async (_, { dto }: obj, context: PrismaClient) => {
          return await context.post.create({ data: dto });
        },
      },
      createProfile: {
        type: TProfile,
        args: { dto: TProfileAdd },
        resolve: async (_, { dto }: obj, context: PrismaClient) => {
          return await context.profile.create({ data: dto });
        },
      },
      deleteUser: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: obj, context: PrismaClient) => {
          return await context.user.delete({ where: { id: id } })
            .then(() => true)
            .catch(_ => false);
        }
      },
      deletePost: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: obj, context: PrismaClient) => {
          return await context.post.delete({ where: { id: id } })
            .then(() => true)
            .catch(_ => false);
        }
      },
      deleteProfile: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: obj, context: PrismaClient) => {
          return await context.profile.delete({ where: { id: id } })
            .then(() => true)
            .catch(_ => false);
        }
      },
    },
  }),
});

