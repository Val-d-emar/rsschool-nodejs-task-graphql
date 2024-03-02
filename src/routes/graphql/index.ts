import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, createGqlQuerySchema } from './schemas.js';
import { GraphQLSchema, graphql } from 'graphql';



const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

//   const typeDefs = `
//   type User {
//     email: String!
//     name: String
//   }

//   type Query {
//     allUsers: [User!]!
//   }
// `;

//   const resolvers = {
//     Query: {
//       allUsers: () => {
//         return prisma.user.findMany();
//       }
//     }
//   };
//   const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//       name: 'Query',
//       fields: {
//         hero: { type: characterInterface, ... },
//       }
//     }),
//     ...
//     // Since this schema references only the `Character` interface it's
//     // necessary to explicitly list the types that implement it if
//     // you want them to be included in the final schema.
//     types: [humanType, droidType],
//   })

//   const Qschema = new GraphQLSchema({
//     resolvers,
//     typeDefs,
//   });

  fastify.route({
    url: '/',
    method: 'POST',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      // return await prisma.user.findMany();
      // req.body.query
      return await graphql({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        schema: createGqlQuerySchema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: prisma,
      });
      // return {};
    },
  });
};

export default plugin;
