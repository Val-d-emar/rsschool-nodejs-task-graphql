import { Type } from '@fastify/type-provider-typebox';
import { GraphQLList, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { TUser } from './types/user.js';
import { PrismaClient } from '@prisma/client';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

// const {
//   body: { errors },
// } = await gqlQuery(app, {
//   query: `query {
//     users {
//         id
//         posts {
//           id
//         }
//         profile {
//           id
//           memberType {
//             id
//           }
//         }
//         userSubscribedTo {
//           id
//         }
//         subscribedToUser {
//           id
//         }
//     }
// }`,
// });

// var { graphql, buildSchema } = require("graphql")

// var schema = buildSchema(`
//   type Query {
//     hello: String
//   }
// `)

// var rootValue = { hello: () => "Hello world!" }

// var source = "{ hello }"

// graphql({ schema, source, rootValue }).then(response => {
//   console.log(response)
// })

// import {
//   graphql,
//   GraphQLSchema,
//   GraphQLObjectType,
//   GraphQLString,
// } from 'graphql';

// var schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'RootQueryType',
//     fields: {
//       hello: {
//         type: GraphQLString,
//         resolve() {
//           return 'world';
//         },
//       },
//     },
//   }),
// });

export const createGqlQuerySchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new GraphQLList(TUser),
        resolve: async (_, { _id }, context: PrismaClient) => {
          return await context.user.findMany();
        },
      },
    },
  }),
});

