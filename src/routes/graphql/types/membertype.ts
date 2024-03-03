import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType } from "graphql";
import { TProfile } from "./profile.js";
import { PrismaClient } from "@prisma/client";
import { MemberTypeId } from "../../member-types/schemas.js";

export const TMemberTypeId = new GraphQLEnumType({
    name: "MemberTypeId",
    values: {
        basic: { value: "basic" },
        business: { value: "business" },
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
            resolve: async ({ id }: obj, _, context: PrismaClient) => {
                return await context.profile.findMany({ where: { memberTypeId: id } });
            },
        },
    }),
});
