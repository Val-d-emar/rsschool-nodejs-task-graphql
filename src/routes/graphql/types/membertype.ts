import { GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLObjectType } from "graphql";
import { TProfile } from "./profile.js";

export const TMemberTypeId = new GraphQLEnumType({
    name: "MemberTypeId",
    values: {
        basic: { value: "basic" },
        business: { value: "business" },
    },
});

export const MemberType: GraphQLObjectType = new GraphQLObjectType({
    name: "MemberType",
    fields: () => ({
        id: { type: TMemberTypeId },
        discount: { type: GraphQLFloat },
        postsLimitPerMonth: { type: GraphQLInt },
        profiles: { type: new GraphQLList(TProfile) },
    }),
});
