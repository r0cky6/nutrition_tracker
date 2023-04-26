import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { env } from "process";
import { Prisma } from "@prisma/client";

export const itemsRouter = createTRPCRouter({
  getByName: publicProcedure
  .input(z.object({ food_name: z.string().nullable() }))
  .query(
    async ({ input, ctx}) => {
      if(!input.food_name || !env.API_APP_ID || !env.API_KEY) return null
      const res = await fetch(
        'https://trackapi.nutritionix.com/v2/natural/nutrients',
        {
          method: "POST",
          body:JSON.stringify({
            query: input.food_name
          }),
          headers: {
            'x-app-id': env.API_APP_ID,
            'x-app-key': env.API_KEY,
            'x-remote-user-id': "1",
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
      }).then(res => res.json())
      
      const nutrients = await ctx.prisma.nutrients.create({data: {
        calories: res.nf_calories,
        protein: res.nf_protein,
        carbohydrates: res.nf_total_carbohydrate,
        total_fat: res.nf_total_fat,
        saturated_fat: res.nf_saturated_fat,
        sodium: res.nf_sodium,
        fiber: res.nf_dietary_fiber,
        potassium: res.nf_potassium
      }, select: {id: true}})
      return await ctx.prisma.items.create({data: {name: input.food_name, nutrients: nutrients.id }, select: {id: true}})
    }
  ),
  known: publicProcedure
  .input(z.object({ id: z.number().min(0).nullable(), name: z.string().nullable() }))
  .query(async ({ input, ctx })=>{
    if(input.name !== null) return await ctx.prisma.items.findFirst({where: {name: input.name}})
    if(input.id !== null) return await ctx.prisma.items.findFirst({where: {id: input.id}})
    return null
  }),
  search: publicProcedure
    .input(z.object({query: z.string().nullable()}))
    .query(async ({ input, ctx }): Promise<{
        common: {
            food_name: string,
            locale: string,
            photo: {
              thumb: string
            },
            serving_qty: number,
            serving_unit: string,
            tag_id: string,
            tag_name: string
        }[]
    } | null> => {
        if(!input.query || !env.API_APP_ID || !env.API_KEY) return null
        return await fetch(
            'https://trackapi.nutritionix.com/v2/search/instant'
             + `?query=${input.query}`
             + '&self=false'
             + '&branded=false'
             + '&common=true'
             + '&common_grocery=true', 
            {
                headers: {
                    method: "GET",
                    'x-app-id': env.API_APP_ID,
                    'x-app-key': env.API_KEY
                },
            }
          ).then(res => res.json())
    }),
    addItem: publicProcedure
        .input(z.object({ id: z.number().min(1) }))
        .mutation(async ({ input, ctx }) => {
          if(!input.id || !env.API_APP_ID || !env.API_KEY) return null
          return await fetch(
            'https://trackapi.nutritionix.com/v2/search/item'
             + `?nix_item_id=${input.id}`,
            {
                headers: {
                    method: "GET",
                    'x-app-id': env.API_APP_ID,
                    'x-app-key': env.API_KEY
                },
            }
          ).then(res => res.json())  
        }),
    removeItem: publicProcedure
        .input(z.object({id: z.number().min(1)}))
        .mutation(({input, ctx}) => {
            return ctx.prisma.items.delete({where: input})
        })
});
