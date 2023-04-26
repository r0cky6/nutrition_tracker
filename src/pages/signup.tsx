import styles from "./index.module.css";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { FormEvent, FormEventHandler, useRef } from "react";

const Signup: NextPage = () => {
  const signupMutation = api.auths.signup.useMutation({onSuccess(data, variables, context) {
    signIn('credentials', {auth_login: variables.login, auth_password: variables.password})
  },})
  function signupHanle(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!login.current?.value || !password.current?.value) throw new Error('empty fields')
    //TODO: check if login is taken before mutating
    signupMutation.mutate({login: login.current.value, password: password.current.value})
  }
  const login = useRef<HTMLInputElement>(null)
  const password = useRef<HTMLInputElement>(null)
  return (
    <>
      <h1>signup</h1>
      <form onSubmit={(e)=>signupHanle(e)}>
        <label htmlFor="login">login</label>
        <input ref={login} type="text" name="login" />
        <label htmlFor="login">password</label>
        <input ref={password} type="password" name="password" />
        <button type="submit">signup</button>
      </form>
    </>
  );
};
export default Signup;
