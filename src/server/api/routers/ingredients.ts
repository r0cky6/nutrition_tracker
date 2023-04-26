import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const ingredientsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({id: z.number().min(1)}))
    .query(
      async ({ input, ctx }) => {
        return ctx.prisma.ingredients.findMany({where: {recipe: input.id}, include:{items:{select:{name: true}}}})
      }
    ),
  addIngredient: protectedProcedure
    .input(z.object({
      recipe: z.number().min(1),
      item: z.number().min(1),
      amount: z.string().min(1).max(5).nullable(),
      unit: z.string().min(1).max(10).nullable()
    }))
    .mutation(
      async ({ input, ctx }) => {
        if(!ctx.session?.user.id) return null
        return await ctx.prisma.ingredients.create({data: input, select: {id: true}})
      }
    ),
  removeIngredient: protectedProcedure
    .input(z.object({id: z.number().min(1)}))
    .mutation(
      async ({ input, ctx }) => {
        return ctx.prisma.ingredients.delete({where: input})
      }
    ),
  editIngredient: protectedProcedure
      .input(z.object({id: z.number().min(1), unit: z.string(), amount: z.string()}))
      .mutation(async ({input, ctx}) => {
        return ctx.prisma.ingredients.update({data: input, where: {id: input.id}})
      })
})