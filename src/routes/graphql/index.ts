import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, createGqlQuerySchema } from './schemas.js';
import { GraphQLSchema, graphql } from 'graphql';



const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

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
