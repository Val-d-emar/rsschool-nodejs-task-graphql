import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType } from "graphql";
import { TProfile } from "./profile.js";
import { MemberTypeId } from "../../member-types/schemas.js";
import { TContext } from "./loader.js";

export const TMemberTypeId = new GraphQLEnumType({
    name: "MemberTypeId",
    values: {
        basic: { value: MemberTypeId.BASIC },
        business: { value: MemberTypeId.BUSINESS },
    },
});

type obj = { id: MemberTypeId }

export const TMemberType: GraphQLObjectType = new GraphQLObjectType({
    name: "MemberType",
    fields: () => ({
        id: { type: TMemberTypeId },
        discount: { type: GraphQLFloat },
        postsLimitPerMonth: { type: GraphQLInt },
        profiles: {
            type: new GraphQLList(TProfile),
            resolve: async ({ id }: obj, _, { prisma }: TContext) => {
                return await prisma.profile.findMany({ where: { memberTypeId: id } });
            },
        },
    }),
});
