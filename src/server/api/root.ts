import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { authsRouter } from "@/server/api/routers/auths";
import { itemsRouter } from "./routers/items";
import { recipesRouter } from "./routers/recipes";
import { ingredientsRouter } from "./routers/ingredients";
import { z } from 'zod';
import { users } from '@prisma/client';
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auths: authsRouter,
  items: itemsRouter,
  recipes: recipesRouter,
  ingredients: ingredientsRouter,
  authorize: publicProcedure
    .input(z.object(
      {auth_login: z.string(), auth_password: z.string()}
    ))
    .query(async ({ input: {auth_login, auth_password}, ctx }) => {
      const users: users[] | null = await ctx.prisma.$queryRaw`
        select (users.id, users.full_name) 
        from users inner join auths on users.auth_id=auths.id 
        where auths.auth_login=${auth_login} 
        and auths.auth_password=crypt(${auth_password}, auth_password);
      `
      return users
    })
});

// export type definition of API
export type AppRouter = typeof appRouter;
