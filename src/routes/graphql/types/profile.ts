import { GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { UUIDType } from "./uuid.js";
import { TUser } from "./user.js";
import { TMemberType, TMemberTypeId } from "./membertype.js";
import { TContext } from "./loader.js";
import DataLoader from "dataloader";
import { MemberTypeId } from "../../member-types/schemas.js";
import { UUID } from "crypto";

type obj = {
  userId: UUID,
  memberTypeId: MemberTypeId,
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
      // resolve: async ({ userId }: obj, _, { prisma }: TContext) => {
      //   return await prisma.user.findFirst({ where: { id: userId } });
      // },
      resolve: async ({ userId }: obj, _, { prisma, loaders }: TContext) => {
        if (loaders.user === undefined) {
          loaders.user = new DataLoader(async (ids) => {
            const res = await prisma.user.findMany({ where: { id: { in: ids as UUID[] } } });
            return ids.map((id) => res.find((r) => r.id === id));
          });
        }
        return await loaders.user.load(userId);
      },
    },
    memberTypeId: { type: TMemberTypeId },
    memberType: {
      type: TMemberType,
      // resolve: async ({ memberTypeId }: obj, _, { prisma }: TContext) => {
      //   return await prisma.memberType.findFirst({ where: { id: memberTypeId } });
      // },
      resolve: async ({ memberTypeId }: obj, _, { prisma, loaders }: TContext) => {
        if (loaders.member === undefined) {
          loaders.member = new DataLoader(async (ids) => {
            const res = await prisma.memberType.findMany({ where: { id: { in: ids as MemberTypeId[] } } });
            return ids.map((id) => res.find((r) => r.id === id));
          });
        }
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