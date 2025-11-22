import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  createGqlResponseSchema,
  gqlResponseSchema,
  createGqlQuerySchema,
} from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import DataLoader from 'dataloader';
import { MemberTypeId } from '../member-types/schemas.js';

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
            user: new DataLoader(async (ids) => {
              const res = await prisma.user.findMany({
                where: { id: { in: ids as string[] } },
              });
              const map = new Map(res.map((u) => [u.id, u]));
              return ids.map((id) => map.get(id as string));
            }),
            post: new DataLoader(async (ids) => {
              const res = await prisma.post.findMany({
                where: { id: { in: ids as string[] } },
              });
              const map = new Map(res.map((p) => [p.id, p]));
              return ids.map((id) => map.get(id as string));
            }),
            profile: new DataLoader(async (ids) => {
              const res = await prisma.profile.findMany({
                where: { id: { in: ids as string[] } },
              });
              const map = new Map(res.map((p) => [p.id, p]));
              return ids.map((id) => map.get(id as string));
            }),
            profileByUser: new DataLoader(async (ids) => {
              const res = await prisma.profile.findMany({
                where: { userId: { in: ids as string[] } },
              });
              const map = new Map(res.map((p) => [p.userId, p]));
              return ids.map((id) => map.get(id as string));
            }),
            member: new DataLoader(async (ids) => {
              const res = await prisma.memberType.findMany({
                where: { id: { in: ids as MemberTypeId[] } },
              });
              const map = new Map(res.map((m) => [m.id, m]));
              return ids.map((id) => map.get(id as string));
            }),
            posts: new DataLoader(async (ids) => {
              const res = await prisma.post.findMany({
                where: { authorId: { in: ids as string[] } },
              });
              return ids.map((id) => res.filter((r) => r.authorId === id));
            }),
            users2sub: new DataLoader(async (ids) => {
              const res = await prisma.subscribersOnAuthors.findMany({
                where: { subscriberId: { in: ids as string[] } },
                include: { author: true },
              });
              return ids.map((id) =>
                res.filter((r) => r.subscriberId === id).map((r) => r.author),
              );
            }),
            subs2user: new DataLoader(async (ids) => {
              const res = await prisma.subscribersOnAuthors.findMany({
                where: { authorId: { in: ids as string[] } },
                include: { subscriber: true },
              });
              return ids.map((id) =>
                res.filter((r) => r.authorId === id).map((r) => r.subscriber),
              );
            }),
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
