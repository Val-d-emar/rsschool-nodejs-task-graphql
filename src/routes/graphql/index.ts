import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, createGqlQuerySchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { TContext } from './types/loader.js';

// const loaders = new WeakMap();

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
      return await new Promise((resolve, reject) => {
        const validation_errors = validate(
          createGqlQuerySchema,
          parse(req.body.query),
          [depthLimit(5)]);
        if (validation_errors.length > 0) {
          reject({
            data: '',
            errors: validation_errors,
          });
        } else {
          resolve(graphql({
            schema: createGqlQuerySchema,
            source: req.body.query,
            variableValues: req.body.variables,
            // contextValue: prisma,
            contextValue: {
              prisma,
              loaders: {
                user : undefined,
                post : undefined,
                profile : undefined,
              },
            },
          }));
        }
      });
    }
  });
};

export default plugin;
