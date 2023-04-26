import s from '@/styles/SearchBar.module.css'
import { api } from '@/utils/api'
import React, { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
  placeholder?: string, 
  variant?: 'input' | 'flat', 
  pickHandle(food_name: string): void 
}
const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'search', variant = 'input', pickHandle }) => {
  const ctx = api.useContext()
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('') 
  interface res {
    food_name: string, 
    locale: string,
    photo: { thumb: string }, 
    serving_qty: number,
    serving_unit: string, 
    tag_id: string,
    tag_name: string
  }
  const [results, setResults] = useState<res[]>([])
  const search = api.items.search.useQuery({query}, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess(data) {
      data?.common && setResults(data.common)
    },
  })
  useEffect(()=> { ctx.items.search.invalidate().then((res)=>res) }, [query])

  return (
    <>
      <div className={s.searchbar}>
        <input 
          ref={input}
          className={`${variant == 'flat' ? s.flat : s.input}`}
          type="text"
          placeholder={placeholder || ''}
          autoCapitalize="false"
          autoComplete="false"
          autoSave="false"
          onChange={(e)=>setQuery(e.target.value)} />
        {!!input?.current?.value.length && 
          <button type="button" onClick={()=>{
            if(input?.current?.value?.length) input.current.value = '' 
              setResults([])
            }}>X</button>
        }
      </div>

      {
        results 
        &&
        <ul className={s.search_results}>
          {results.map(
            (el, ind) => (
              <li key={ind} onClick={()=>{pickHandle(el.food_name)}}>
                <div className={s.img_container}>
                  <img src={el.photo.thumb} height="40px"/>
                </div>
                <span>{el.food_name}</span>
              </li>
            )
          )}
        </ul> 
      }
    </>
  )
}

export default SearchBar