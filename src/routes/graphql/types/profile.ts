import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { TUser } from './user.js';
import { TMemberType, TMemberTypeId } from './membertype.js';
import { TContext } from './loader.js';
import { MemberTypeId } from '../../member-types/schemas.js';
import { UUID } from 'crypto';

type obj = {
  userId: UUID;
  memberTypeId: MemberTypeId;
};
export const TProfile: GraphQLObjectType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    user: {
      type: TUser,
      resolve: async ({ userId }: obj, _, { loaders }: TContext) => {
        return await loaders.user.load(userId);
      },
    },
    memberTypeId: { type: TMemberTypeId },
    memberType: {
      type: TMemberType,
      resolve: async ({ memberTypeId }: obj, _, { loaders }: TContext) => {
        return await loaders.member.load(memberTypeId);
      },
    },
  }),
});

export const TProfileAdd = {
  type: new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: () => ({
      userId: { type: new GraphQLNonNull(UUIDType) },
      memberTypeId: { type: new GraphQLNonNull(TMemberTypeId) },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
    }),
  }),
};

export const TProfileUpd = {
  type: new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: () => ({
      memberTypeId: { type: TMemberTypeId },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
    }),
  }),
};
