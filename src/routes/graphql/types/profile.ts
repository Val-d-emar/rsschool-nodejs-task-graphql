import { GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLSchema } from "graphql";
import { UUIDType } from "./uuid.js";
import { TUser } from "./user.js";
import { TMemberType, TMemberTypeId } from "./membertype.js";
import { TContext } from "./loader.js";

type obj = {
  userId: string,
  memberTypeId: string,
}
export const TProfile: GraphQLObjectType = new GraphQLObjectType({
  name: "Profile",
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    user: {
      type: TUser,
      resolve: async ({ userId }: obj, _, { prisma }: TContext) => {
        return await prisma.user.findFirst({ where: { id: userId } });
      },
    },
    memberTypeId: { type: TMemberTypeId },
    memberType: {
      type: TMemberType,
      resolve: async ({ memberTypeId }: obj, _, { prisma }: TContext) => {
        return await prisma.memberType.findFirst({ where: { id: memberTypeId } });
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
  })
}

export const TProfileUpd = {
  type: new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: () => ({
      memberTypeId: { type: TMemberTypeId },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
    }),
  })
}