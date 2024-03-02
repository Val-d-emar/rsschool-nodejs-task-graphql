import { GraphQLBoolean, GraphQLInt, GraphQLObjectType, GraphQLSchema } from "graphql";
import { UUIDType } from "./uuid.js";
import { TUser } from "./user.js";
import { MemberType, TMemberTypeId } from "./membertype.js";

export const TProfile: GraphQLObjectType = new GraphQLObjectType({
    name: "Profile",
    fields: () => ({
      id: { type: UUIDType },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      userId: { type: UUIDType },
      user: { type: TUser},      
      memberTypeId: { type: TMemberTypeId },
      memberType: { type: MemberType },
    }),
  });
