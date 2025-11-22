import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  createGqlResponseSchema,
  gqlResponseSchema,
  createGqlQuerySchema,
} from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      // return graphql();
      const { query, variables } = req.body;

      const validationErrors = validate(createGqlQuerySchema, parse(query), [
        depthLimit(5),
      ]);

      if (validationErrors.length > 0) {
        return { data: null, errors: validationErrors };
      }

      const result = await graphql({
        schema: createGqlQuerySchema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma,
          loaders: {
            user: undefined,
            users2sub: undefined,
            post: undefined,
            posts: undefined,
            profile: undefined,
            member: undefined,
            subs2user: undefined,
          },
        },
      });
      // if (result.errors) {
      //   console.error(
      //     'GRAPHQL EXECUTION ERRORS:',
      //     JSON.stringify(result.errors, null, 2),
      //   );
      // }

      return result;
    },
  });
};

export default plugin;
