import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { auths, recipes, users } from "@prisma/client";
import { readFile, writeFile } from "fs/promises";
import { dirname } from "path";

export const recipesRouter = createTRPCRouter({
  // TODO rewrite input.id to be a number?
  // recipe metadata
  readMeta: publicProcedure
    .input(z.object({id: z.number().min(1)}))
    .query(async ({input, ctx}) => await ctx.prisma.recipes.findFirst({where: input})),
  writeMeta: protectedProcedure
    // TODO: add more changeable meta
    .input(z.object({
      id: z.number().min(1), 
      meta: z.object({
        title: z.string().min(1),
        yeald: z.number().min(0),
        unit: z.string().min(0)
      }) 
    }))
    .mutation(({input, ctx})=>ctx.prisma.recipes.update({data: input.meta, where: {id: input.id}})),
  // recipe file
  read: publicProcedure
    .input(z.object({id: z.number().min(1)}))
    .query(async ({ input, ctx }) => {
      return await readFile(dirname('.') + `/public/md/${input.id}.md`, 'utf-8')
    }),
  write: protectedProcedure
    .input(z.object({id: z.number().min(1), recipe: z.string()}))
    .mutation(({input})=> writeFile(dirname('.') + `/public/md/${input.id}.md`, input.recipe, 'utf-8')),
  
  // general
  addRecipe: protectedProcedure
    .mutation(async ({ ctx }) => {
        if(!ctx.session?.user.id) return null
        return await ctx.prisma.recipes.create({data: {author: ctx.session?.user.id, title: 'new recipe'}})
    }),
  removeRecipe: protectedProcedure
  .input(z.object({
    id: z.number().min(1)
  }))  
  .mutation(async ({input, ctx}) => {
    await ctx.prisma.ingredients.deleteMany({where: {recipe: input.id}})
    return ctx.prisma.recipes.delete({where: input})
  }),
  list: publicProcedure
    .query(async ({ ctx }): Promise<recipes[]> => {
        return await ctx.prisma.recipes.findMany()
    })
});
