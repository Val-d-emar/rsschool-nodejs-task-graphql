import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';
import { TUser, TUserAdd, TUserUpd } from './types/user.js';
import { TPost, TPostAdd, TPostUpd } from './types/post.js';
import { UUIDType } from './types/uuid.js';
import { TProfile, TProfileAdd, TProfileUpd } from './types/profile.js';
import { TMemberType, TMemberTypeId } from './types/membertype.js';
import { MemberTypeId } from '../member-types/schemas.js';
import { UUID } from 'node:crypto';
import { TContext } from './types/loader.js';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { User } from '@prisma/client';

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

interface CreateUserDto {
  name: string;
  balance: number;
}
interface ChangeUserDto {
  name?: string;
  balance?: number;
}

interface CreatePostDto {
  title: string;
  content: string;
  authorId: UUID;
}
interface ChangePostDto {
  title?: string;
  content?: string;
  authorId?: UUID;
}

interface CreateProfileDto {
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: MemberTypeId;
  userId: UUID;
}
interface ChangeProfileDto {
  memberTypeId?: MemberTypeId;
  isMale?: boolean;
  yearOfBirth?: number;
}

interface SubscribeDto {
  userId: UUID;
  authorId: UUID;
}

type IdArgs = { id: UUID };
type MemberIdArgs = { id: MemberTypeId };

const uid = {
  type: UUIDType,
};
const mid = {
  type: TMemberTypeId,
};

interface ParsedInfo {
  fieldsByTypeName: {
    [typeName: string]: {
      [fieldName: string]: unknown;
    };
  };
}

interface UserWithRelations extends User {
  userSubscribedTo?: { author: User }[];
  subscribedToUser?: { subscriber: User }[];
}

export const createGqlQuerySchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new GraphQLList(TUser),
        resolve: async (_, __, { prisma, loaders }: TContext, info) => {
          const parsedInfo = parseResolveInfo(info) as unknown as ParsedInfo;
          const fields = parsedInfo.fieldsByTypeName['User'];

          const includeConfig: {
            userSubscribedTo?: { include: { author: true } };
            subscribedToUser?: { include: { subscriber: true } };
          } = {};

          if (fields) {
            if ('userSubscribedTo' in fields) {
              includeConfig.userSubscribedTo = { include: { author: true } };
            }
            if ('subscribedToUser' in fields) {
              includeConfig.subscribedToUser = { include: { subscriber: true } };
            }
          }

          const users = await prisma.user.findMany({
            include: Object.keys(includeConfig).length > 0 ? includeConfig : undefined,
          });

          const typedUsers = users as unknown as UserWithRelations[];

          if (includeConfig.userSubscribedTo || includeConfig.subscribedToUser) {
            for (const user of typedUsers) {
              if (includeConfig.userSubscribedTo && user.userSubscribedTo) {
                const authors = user.userSubscribedTo.map((sub) => sub.author);
                loaders.users2sub.prime(user.id, authors);
              }
              if (includeConfig.subscribedToUser && user.subscribedToUser) {
                const subscribers = user.subscribedToUser.map((sub) => sub.subscriber);
                loaders.subs2user.prime(user.id, subscribers);
              }
            }
          }
          return users;
        },
      },
      posts: {
        type: new GraphQLList(TPost),
        resolve: async (_, __, { prisma }: TContext) => {
          return await prisma.post.findMany();
        },
      },
      profiles: {
        type: new GraphQLList(TProfile),
        resolve: async (_, __, { prisma }: TContext) => {
          return await prisma.profile.findMany();
        },
      },
      memberTypes: {
        type: new GraphQLList(TMemberType),
        resolve: async (_, __, { prisma }: TContext) => {
          return await prisma.memberType.findMany();
        },
      },
      user: {
        type: TUser,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { loaders }: TContext) => {
          return await loaders.user.load(id);
        },
      },
      post: {
        type: TPost,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { loaders }: TContext) => {
          return await loaders.post.load(id);
        },
      },
      profile: {
        type: TProfile,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { loaders }: TContext) => {
          return await loaders.profile.load(id);
        },
      },
      memberType: {
        type: new GraphQLNonNull(TMemberType),
        args: { id: mid },
        resolve: async (_, { id }: MemberIdArgs, { loaders }: TContext) => {
          return await loaders.member.load(id);
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
        resolve: async (_, { dto }: { dto: CreateUserDto }, { prisma }: TContext) => {
          return await prisma.user.create({ data: dto });
        },
      },
      createPost: {
        type: TPost,
        args: { dto: TPostAdd },
        resolve: async (_, { dto }: { dto: CreatePostDto }, { prisma }: TContext) => {
          return await prisma.post.create({ data: dto });
        },
      },
      createProfile: {
        type: TProfile,
        args: { dto: TProfileAdd },
        resolve: async (_, { dto }: { dto: CreateProfileDto }, { prisma }: TContext) => {
          return await prisma.profile.create({ data: dto });
        },
      },
      deleteUser: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { prisma }: TContext) => {
          try {
            await prisma.user.delete({ where: { id } });
            return true;
          } catch {
            return false;
          }
        },
      },
      deletePost: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { prisma }: TContext) => {
          try {
            await prisma.post.delete({ where: { id } });
            return true;
          } catch {
            return false;
          }
        },
      },
      deleteProfile: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { prisma }: TContext) => {
          try {
            await prisma.profile.delete({ where: { id } });
            return true;
          } catch {
            return false;
          }
        },
      },
      changeUser: {
        type: TUser,
        args: { id: uid, dto: TUserUpd },
        resolve: async (
          _,
          { id, dto }: { id: UUID; dto: ChangeUserDto },
          { prisma }: TContext,
        ) => {
          return await prisma.user.update({ where: { id }, data: dto });
        },
      },
      changePost: {
        type: TPost,
        args: { id: uid, dto: TPostUpd },
        resolve: async (
          _,
          { id, dto }: { id: UUID; dto: ChangePostDto },
          { prisma }: TContext,
        ) => {
          return await prisma.post.update({ where: { id }, data: dto });
        },
      },
      changeProfile: {
        type: TProfile,
        args: { id: uid, dto: TProfileUpd },
        resolve: async (
          _,
          { id, dto }: { id: UUID; dto: ChangeProfileDto },
          { prisma }: TContext,
        ) => {
          return await prisma.profile.update({ where: { id }, data: dto });
        },
      },
      subscribeTo: {
        type: GraphQLBoolean,
        args: { userId: uid, authorId: uid },
        resolve: async (_, { userId, authorId }: SubscribeDto, { prisma }: TContext) => {
          try {
            await prisma.subscribersOnAuthors.create({
              data: { subscriberId: userId, authorId },
            });
            return true;
          } catch {
            return false;
          }
        },
      },
      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: { userId: uid, authorId: uid },
        resolve: async (_, { userId, authorId }: SubscribeDto, { prisma }: TContext) => {
          try {
            await prisma.subscribersOnAuthors.deleteMany({
              where: { subscriberId: userId, authorId },
            });
            return true;
          } catch {
            return false;
          }
        },
      },
    },
  }),
});
