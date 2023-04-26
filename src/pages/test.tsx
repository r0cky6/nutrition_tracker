import { api } from '@/utils/api';
import { PrismaClient, users } from '@prisma/client';
import { NextPage } from 'next';
import { FormEvent, useRef } from 'react';
const test: NextPage = () => {
    const login = useRef<HTMLInputElement>(null)
    const password = useRef<HTMLInputElement>(null)
    const authorize = api.authorize.useQuery({
        auth_login: login.current?.value || 'e', 
        auth_password: password.current?.value || 'e'
    },
    )
    const refetch = (e: FormEvent) => {
        e.preventDefault()
        console.log({
            auth_login: login.current?.value || '', 
            auth_password: password.current?.value || ''
        })
        authorize.refetch()
    }
    return <>
        <form onSubmit={(e: FormEvent) => refetch(e)}>
            <input ref={login} type='text' placeholder='login'/>
            <input ref={password} type='password' placeholder='password'/>
            <button>auth</button>
            {JSON.stringify(authorize.data)}
        </form>
    </>
}

export default test