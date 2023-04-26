import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { Recipes } from "@/views/Recipes";

const Home: NextPage = () => {
  const { data: sessionData } = useSession()

  return (
    <>
      { sessionData?.user?.id &&
        <>
          <AddRecipe id={sessionData?.user.id} />
          <Recipes/>
        </>
      }
    </>
  );
};

export default Home;

export const AddRecipe = ({id}: {id: number}) => {
  const router = useRouter()
  const ctx = api.useContext()
  const add = api.recipes.addRecipe.useMutation({
    onSuccess: (data) => {
      if (data?.id) return router.push(`/recipes/${data.id}/edit`)
      ctx.recipes.list.invalidate()
    }
  })

  return (
    <div style={{display: 'grid', gridAutoFlow:'column', gridTemplateColumns: 'max-content auto', columnGap:'2ch'}}>
      <button style={{height:'3em'}} type="button" onClick={() => add.mutate()}>Add recipe</button>
      <input type='text' style={{padding: '0 1em'}} placeholder='Search...'/>
    </div>
  )
}
