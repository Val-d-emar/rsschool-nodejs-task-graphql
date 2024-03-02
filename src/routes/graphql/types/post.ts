import { GraphQLObjectType, GraphQLString } from "graphql";
import { UUIDType } from "./uuid.js";
import { TUser } from "./user.js";

export const TPost: GraphQLObjectType = new GraphQLObjectType({
    name: "Post",
    fields: () => ({
        id: { type: UUIDType },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        authorId: { type: UUIDType },
        author: { type: TUser },
    }),
});
