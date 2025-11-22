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

const uid = { type: UUIDType };
const mid = { type: TMemberTypeId };

interface ParsedInfo {
  fieldsByTypeName: {
    [typeName: string]: {
      [fieldName: string]: unknown;
    };
  };
}

interface UserWithLinks extends User {
  userSubscribedTo?: { subscriberId: string; authorId: string }[];
  subscribedToUser?: { subscriberId: string; authorId: string }[];
}

export const createGqlQuerySchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new GraphQLList(TUser),
        resolve: async (_, __, { prisma, loaders }: TContext, info) => {
          const parsedInfo = parseResolveInfo(info) as unknown as ParsedInfo;
          const fields = parsedInfo?.fieldsByTypeName?.User || {};

          const includeConfig: {
            userSubscribedTo?: boolean;
            subscribedToUser?: boolean;
          } = {};

          if ('userSubscribedTo' in fields) {
            includeConfig.userSubscribedTo = true;
          }
          if ('subscribedToUser' in fields) {
            includeConfig.subscribedToUser = true;
          }

          const users = await prisma.user.findMany({
            include: Object.keys(includeConfig).length > 0 ? includeConfig : undefined,
          });

          const typedUsers = users as unknown as UserWithLinks[];

          if (includeConfig.userSubscribedTo || includeConfig.subscribedToUser) {
            for (const user of typedUsers) {
              if (includeConfig.userSubscribedTo && user.userSubscribedTo) {
                const authors = user.userSubscribedTo.map(
                  (sub) =>
                    ({
                      id: sub.authorId,
                      name: '',
                      balance: 0,
                    }) as User,
                );
                loaders.users2sub.prime(user.id, authors);
              }
              if (includeConfig.subscribedToUser && user.subscribedToUser) {
                const subscribers = user.subscribedToUser.map(
                  (sub) =>
                    ({
                      id: sub.subscriberId,
                      name: '',
                      balance: 0,
                    }) as User,
                );
                loaders.subs2user.prime(user.id, subscribers);
              }
            }
          }
          return users;
        },
      },
      posts: {
        type: new GraphQLList(TPost),
        resolve: async (_, __, { prisma }: TContext) => prisma.post.findMany(),
      },
      profiles: {
        type: new GraphQLList(TProfile),
        resolve: async (_, __, { prisma }: TContext) => prisma.profile.findMany(),
      },
      memberTypes: {
        type: new GraphQLList(TMemberType),
        resolve: async (_, __, { prisma }: TContext) => prisma.memberType.findMany(),
      },
      user: {
        type: TUser,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { loaders }: TContext) =>
          loaders.user.load(id),
      },
      post: {
        type: TPost,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { loaders }: TContext) =>
          loaders.post.load(id),
      },
      profile: {
        type: TProfile,
        args: { id: uid },
        resolve: async (_, { id }: IdArgs, { loaders }: TContext) =>
          loaders.profile.load(id),
      },
      memberType: {
        type: new GraphQLNonNull(TMemberType),
        args: { id: mid },
        resolve: async (_, { id }: MemberIdArgs, { loaders }: TContext) =>
          loaders.member.load(id),
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: TUser,
        args: { dto: TUserAdd },
        resolve: async (_, { dto }: { dto: CreateUserDto }, { prisma }: TContext) =>
          prisma.user.create({ data: dto }),
      },
      createPost: {
        type: TPost,
        args: { dto: TPostAdd },
        resolve: async (_, { dto }: { dto: CreatePostDto }, { prisma }: TContext) =>
          prisma.post.create({ data: dto }),
      },
      createProfile: {
        type: TProfile,
        args: { dto: TProfileAdd },
        resolve: async (_, { dto }: { dto: CreateProfileDto }, { prisma }: TContext) =>
          prisma.profile.create({ data: dto }),
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
        ) => prisma.user.update({ where: { id }, data: dto }),
      },
      changePost: {
        type: TPost,
        args: { id: uid, dto: TPostUpd },
        resolve: async (
          _,
          { id, dto }: { id: UUID; dto: ChangePostDto },
          { prisma }: TContext,
        ) => prisma.post.update({ where: { id }, data: dto }),
      },
      changeProfile: {
        type: TProfile,
        args: { id: uid, dto: TProfileUpd },
        resolve: async (
          _,
          { id, dto }: { id: UUID; dto: ChangeProfileDto },
          { prisma }: TContext,
        ) => prisma.profile.update({ where: { id }, data: dto }),
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
