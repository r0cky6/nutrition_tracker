import { api } from "@/utils/api"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Children, FC, PropsWithChildren, ReactNode } from "react"

export const Recipes = () => {
  const recipes = api.recipes.list.useQuery(undefined, {refetchOnWindowFocus: false})
  
  return (
    <ul style={{listStyle: 'none', display: 'grid', padding: 0, gridTemplateColumns: 'repeat(3, 1fr)', gridGap: '.5em'}}>
    {
      recipes.data &&
      recipes.data.map(el => 
        <li key={el.id} style={{backgroundColor: 'rgba(194, 194, 194, 0.123)',border: '1px solid rgba(194, 194, 194, 0.445)', borderRadius: '3px', padding: '.25em .5em'}}>
          <RecipeLink id={el.id}>{el.title}</RecipeLink>
        </li>
        
      )
    }
    </ul>
  )
}
type RecipeLinkProps = {
  id: number
}
const RecipeLink: FC<PropsWithChildren<RecipeLinkProps>> = ({id, children}) => { return (
  <>
    <Link 
      style={{textDecoration: 'underline'}} 
      href='/recipes/[id]' 
      as={`/recipes/${id}`}
    >
    {children}
    </Link>
    {/* TODO: render only for recipe author */}
    <Link 
      style={{textDecoration: 'underline', margin:'0 1ch'}} 
      href='/recipes/[id]/edit'
      as={`/recipes/${id}/edit`}
      >
    edit
    </Link> 
  </>
)}