import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { UUIDType } from './uuid.js';
import { TProfile } from './profile.js';
import { TPost } from './post.js';

export const TUser = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: UUIDType },
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
        profile: { type: TProfile },
        posts: { type: new GraphQLList(TPost) },
        userSubscribedTo: { type: new GraphQLList(TUser) },
        subscribedToUser: { type: new GraphQLList(TUser) },
    }),
});
