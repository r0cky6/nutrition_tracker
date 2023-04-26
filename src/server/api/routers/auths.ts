import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { auths, users } from "@prisma/client";

export const authsRouter = createTRPCRouter({
  signin: publicProcedure
    .input(z.object({auth_login: z.string().min(1), auth_password: z.string().min(1)}))
    .query(async ({ input, ctx }) : Promise<users | null> => {
      // return await ctx.prisma.auths.findFirstOrThrow({where: input})
      console.log("SIGNIN")
      const auth: auths = await ctx.prisma.$queryRaw`select id * from auths where auth_login=${input.auth_login} and auth_password=${input.auth_password}`
      if (!auth) return null
      const user: users[] = await ctx.prisma.$queryRaw`select * from users where auth_id=${auth.id}` 
      console.log(user[0])
      return user[0] || null
      
    }),
  signup: publicProcedure
    .input(z.object({
      login: z.string().min(1),
      password: z.string().min(1)
    }))
    .mutation(async ({input, ctx})=>{
      const newUser = await ctx.prisma.auths.create({data: {auth_login: input.login, auth_password: input.password}})
      return {id: newUser.id, login: newUser.auth_login}
    })
});
