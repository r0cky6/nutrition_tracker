import { api } from '@/utils/api'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NextPage } from 'next/types'
import { FC, FormEvent, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import s from '@/styles/RecipeOverview.module.css'
import SearchBar from '@/components/SearchBar'

type RecipeOverviewProps = {
  mode: 'view' | 'edit'
}
interface ChildrenProps extends RecipeOverviewProps {
  id: number
}

const RecipeOverview: NextPage<RecipeOverviewProps> = ({ mode }) => {
  const id = parseInt(useRouter().query.id as string, 10)
  // queries
  const router = useRouter()

  const remove = api.recipes.removeRecipe.useMutation({onSuccess(){
    router.push('/')
  }})
  return (
    <div className={s.recipe_overview__container}>
      <button type='button' onClick={()=>remove.mutate({id})}>delete recipe</button>
      <RecipeMeta id={id} mode={mode} />
      <Ingredients id={id} mode={mode}/>
      <hr />
      <RecipeInstructions id={id} mode={mode}/>
    </div>
  )
}

const RecipeMeta: FC<ChildrenProps> = ({ id, mode }) => {
  const {data: meta} = api.recipes.readMeta.useQuery(
    { id }, 
    {
      refetchOnWindowFocus: false, 
      refetchOnReconnect: false, 
    }
  )
  const writeMeta = api.recipes.writeMeta.useMutation()

  const title = useRef<HTMLInputElement>(null)
  const yeald = useRef<HTMLInputElement>(null)
  const unit  = useRef<HTMLInputElement>(null)

  const saveMeta = (e: FormEvent) => {
    e.preventDefault()
    writeMeta.mutate({
      id, 
      meta: {
        title: title.current?.value || 'default title',
        yeald: yeald.current?.valueAsNumber || 0,
        unit: unit.current?.value || 'g'
      }
    })
  }
  return (
    <>
    {
      mode == 'edit' 
      &&
      <>
      <button type='button' style={{marginLeft: '1ch'}}><Link href={`/recipes/${id}`}>view mode</Link></button>
      <form 
        className={`${s.recipe__meta} ${s.recipe__meta_edit}`}
        onBlur={(e)=>saveMeta(e)}
        >
        <h1>
          <input 
          ref={title}
          className={s.recipe__title}
          type='text' 
          defaultValue={meta?.title || 'Recipe title'}
          placeholder='title' />
        </h1>
        Yeald: <span> </span>
        <input 
          ref={yeald}
          onChange={()=> {
            if(yeald.current?.style) yeald.current.style.width = (yeald.current?.value.length || 0) + 5 + 'ch'
          }}
          className={s.recipe__yeald}
          type='number'
          defaultValue={meta?.yeald?.toString() || 0} 
          placeholder='0'
        />
        <input 
          ref={unit}
          onChange={()=> {
            if(yeald.current?.style) yeald.current.style.width = (yeald.current?.value.length || 0) + 5 + 'ch'
          }}
          className={s.recipe__unit} 
          type='text' 
          defaultValue={meta?.unit || 'unit'}
          placeholder='g' 
        />
  {/* TODO: show save button only when changes were made */}
      </form>
    </>
      ||
      <>
        <button type='button' style={{marginLeft: '1ch'}}><Link href={`/recipes/${id}/edit`}>edit mode</Link></button>
        <div className={`${s.recipe__meta} ${s.recipe__meta_view}`}>
          <h1 className={s.recipe__title}>{meta?.title || 'no title'}</h1>
          <p style={{display: 'inline'}} className={s.recipe__yeald}>Yeald: {meta?.yeald?.toString() || 'no yeald'} {meta?.unit || 'no unit'}</p>
        </div>
      </>
    }
    </>
  )
}

const Ingredients: FC<ChildrenProps> = ({ id, mode }) => {
  const [foodName, setFoodName] = useState('')
  const ctx = api.useContext()
  const addIngredient = api.ingredients.addIngredient.useMutation()
  const knownIngredient = api.items.known.useQuery({ id: null, name: foodName || null },
    {
      enabled: false,
      onSettled(data){
        if(!!data?.id) return addIngredient.mutate({recipe: id, item: data.id, amount: '0', unit: 'g'})
        byName.refetch()
      }
    })
  const byName = api.items.getByName.useQuery({ food_name: foodName || null }, {
    enabled: false,
    onSuccess(data){
      data?.id && addIngredient.mutate(
        {recipe: id, item: data.id, amount: '0', unit: 'g'}, 
        {onSuccess(){ ctx.ingredients.list.invalidate() }}
      )
    }
  })
  const searchPick = (food_name: string) => {
    setFoodName(food_name)
    ingredients.refetch()
  }
  useEffect(()=>{ knownIngredient.refetch() }, [foodName])
  const ingredients = api.ingredients.list.useQuery({ id }, { enabled: false })
  useEffect(() => { ingredients.refetch() }, [])

  const unit = useRef<HTMLInputElement>(null)
  const amount = useRef<HTMLInputElement>(null)
  const edit = api.ingredients.editIngredient.useMutation()
  const remove = api.ingredients.removeIngredient.useMutation({onSuccess(){ingredients.refetch()}})
  
  return <>
    <ul style={{listStyle: 'none', padding: 0}}>
      {
        ingredients?.data && 
        ingredients.data.map((el, ind) => mode == 'view' 
          ? <li key={ind}>
              <span style={{display: 'inline-block', width: '3ch'}}>{ind+1})</span> 
              {el.amount} {el.unit}, {el.items?.name}
            </li> 
          : <li key={ind}>
              <form>
                <button type='button' onClick={()=> remove.mutate({ id: el.id }) }>X</button>
                <span style={{display: 'inline-block', width: '3ch'}}>{ind+1})</span>
                <input onBlur={()=> {
                if (!amount.current?.value || !unit.current?.value) throw new Error('empty fields.')
                edit.mutate({id: el.id, amount: amount.current?.value, unit: unit.current.value})
              }} ref={amount} type='text' defaultValue={el.amount || ''} placeholder='0' style={{paddingRight: '1ch', width: '5ch'}} />
                <input onBlur={()=> {
                if (!amount.current?.value || !unit.current?.value) throw new Error('empty fields.')
                edit.mutate({id: el.id, amount: amount.current?.value, unit: unit.current.value})
              }} ref={unit} type='text' defaultValue={el.unit || ''} placeholder='g' style={{width: '6ch'}} />
                <span style={{paddingLeft: '1ch'}}>{el.items?.name}</span>
              </form>
            </li>
          )
        }
    </ul>
    {
      mode == 'edit' &&
      <SearchBar placeholder='Add ingredient...' variant='flat' pickHandle={searchPick}/>
    }
  </>
}

const RecipeInstructions: FC<ChildrenProps> = ({ id, mode }) => {
  const [recipe, setRecipe] = useState('')
  
  const write = api.recipes.write.useMutation()
  const saveRecipe = () => write.mutate({ id, recipe })

  const readRecipe = api.recipes.read.useQuery(
    {id}, 
    {
      enabled: false,
      onSuccess(data) { setRecipe(data) }
    }
  )
  useEffect(()=>{readRecipe.refetch()}, [])
  return <>
    <div className={s.recipe_instructions__container}>
      {
        mode === 'edit' &&
        <textarea 
          className={s.recipe_instructions__edit}
          cols={30} rows={10} 
          defaultValue={recipe}
          onChange={e => setRecipe(e.target.value) }
          onBlur={saveRecipe}
        />
      }
      <div className={s.recipe_instructions__preview}>
        <ReactMarkdown children={recipe} remarkPlugins={[remarkGfm]} />
      </div>
    </div>
  </>
}

export default RecipeOverview
