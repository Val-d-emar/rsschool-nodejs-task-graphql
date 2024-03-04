import { Type } from '@fastify/type-provider-typebox';
import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { TUser, TUserAdd, TUserUpd } from './types/user.js';
import { TPost, TPostAdd, TPostUpd } from './types/post.js';
import { UUIDType } from './types/uuid.js';
import { TProfile, TProfileAdd, TProfileUpd } from './types/profile.js';
import { TMemberType, TMemberTypeId } from './types/membertype.js';
import { MemberTypeId } from '../member-types/schemas.js';
import { UUID } from 'node:crypto';
import { TContext } from './types/loader.js';
import DataLoader from 'dataloader';


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
        resolve: async (_, __, { prisma }: TContext) => {
          return await prisma.user.findMany();
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
        // resolve: async (_, { id }: obj, { prisma }: TContext) => {
        //   return await prisma.user.findFirst({ where: { id } });
        // },
        resolve: async (_, { id }: obj, { prisma, loaders }: TContext) => {
          if (loaders.user === undefined) {
            loaders.user = new DataLoader(async (ids) => {
              const res = await prisma.user.findMany({ where: { id: { in: ids as string[] } } });
              return ids.map((id) => res.find((r) => r.id === id));
            });
          }
          return await loaders.user.load(id);
        },
      },
      post: {
        type: TPost,
        args: { id: uid },
        resolve: async (_, { id }: obj, { prisma }: TContext) => {
          return await prisma.post.findFirst({ where: { id } });
        },
      },
      profile: {
        type: TProfile,
        args: { id: uid },
        resolve: async (_, { id }: obj, { prisma }: TContext) => {
          return await prisma.profile.findFirst({ where: { id } });
        },
      },
      memberType: {
        type: new GraphQLNonNull(TMemberType),
        args: { id: mid },
        resolve: async (_, { id }: objm, { prisma }: TContext) => {
          return await prisma.memberType.findFirst({ where: { id } });
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
        resolve: async (_, { dto }: obj, { prisma }: TContext) => {
          return await prisma.user.create({ data: dto });
        },
      },
      createPost: {
        type: TPost,
        args: { dto: TPostAdd },
        resolve: async (_, { dto }: obj, { prisma }: TContext) => {
          return await prisma.post.create({ data: dto });
        },
      },
      createProfile: {
        type: TProfile,
        args: { dto: TProfileAdd },
        resolve: async (_, { dto }: obj, { prisma }: TContext) => {
          return await prisma.profile.create({ data: dto });
        },
      },
      deleteUser: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: obj, { prisma }: TContext) => {
          return await prisma.user.delete({ where: { id } })
            .then(() => true)
            .catch(_ => false);
        }
      },
      deletePost: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: obj, { prisma }: TContext) => {
          return await prisma.post.delete({ where: { id } })
            .then(() => true)
            .catch(_ => false);
        }
      },
      deleteProfile: {
        type: GraphQLBoolean,
        args: { id: uid },
        resolve: async (_, { id }: obj, { prisma }: TContext) => {
          return await prisma.profile.delete({ where: { id } })
            .then(() => true)
            .catch(_ => false);
        }
      },
      changeUser: {
        type: TUser,
        args: { id: uid, dto: TUserUpd },
        resolve: async (_, { id, dto }: obj, { prisma }: TContext) => {
          return await prisma.user.update({ where: { id }, data: dto });
        }
      },
      changePost: {
        type: TPost,
        args: { id: uid, dto: TPostUpd },
        resolve: async (_, { id, dto }: obj, { prisma }: TContext) => {
          return await prisma.post.update({ where: { id }, data: dto });
        }
      },
      changeProfile: {
        type: TProfile,
        args: { id: uid, dto: TProfileUpd },
        resolve: async (_, { id, dto }: obj, { prisma }: TContext) => {
          return await prisma.profile.update({ where: { id }, data: dto });
        }
      },
      subscribeTo: {
        type: TUser,
        args: { userId: uid, authorId: uid },
        resolve: async (_, { userId, authorId }: obj['dto'], { prisma }: TContext) => {
          return await prisma.subscribersOnAuthors.create({ data: { subscriberId: userId, authorId } })
            .then(async () => await prisma.user.findFirst({ where: { id: userId } }));
        },
      },
      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: { userId: uid, authorId: uid },
        resolve: async (_, { userId, authorId }: obj['dto'], { prisma }: TContext) => {
          return await prisma.subscribersOnAuthors.deleteMany({ where: { subscriberId: userId, authorId } })
            .then(() => true)
            .catch(_ => false);
        },
      },
    },
  }),
});

