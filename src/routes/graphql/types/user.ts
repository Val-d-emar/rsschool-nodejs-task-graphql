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

type obj = { id: UUID };

export const TUser: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: TProfile,
      resolve: async ({ id }: obj, _, { loaders }: TContext) => {
        return await loaders.profileByUser.load(id);
      },
    },
    posts: {
      type: new GraphQLList(TPost),
      resolve: async ({ id }: obj, _, { loaders }: TContext) => {
        return await loaders.posts.load(id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(TUser),
      resolve: async ({ id }: obj, _, { loaders }: TContext) => {
        // console.log(`DEBUG: Resolving userSubscribedTo for ${id}`);
        return await loaders.users2sub.load(id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(TUser),
      resolve: async ({ id }: obj, _, { loaders }: TContext) => {
        // console.log(`DEBUG: Resolving subscribedToUser for ${id}`);
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
