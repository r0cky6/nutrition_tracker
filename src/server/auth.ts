import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  User,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { auths, users } from "@prisma/client";
import { DefaultJWT, JWT } from "next-auth/jwt";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      name: string,
      login: string
    };
  }
  interface JWT extends DefaultJWT {
    login: string
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session:{
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30
  },
  callbacks: {
    redirect(){
      return '/'
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.sub);
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
    name: 'Credentials',
    credentials: {
      auth_login: { label: "Login", type: "text", placeholder: "login" },
      auth_password: {  label: "Password", type: "password", placeholder: "password" }
    },
    async authorize(credentials: {auth_login: string, auth_password: string} | undefined) {
      if (!credentials || !credentials.auth_login || !credentials.auth_password) return null
      // const users: users[] | null = await prisma.$queryRaw`
      //   select (users.id, users.full_name) 
      //   from users inner join auths on users.auth_id=auths.id 
      //   where auths.auth_login=${credentials.auth_login} 
      //   and auths.auth_password=crypt(${credentials.auth_password}, auth_password);
      // `
      const auths: auths[] | null = await prisma.$queryRaw`select * from auths where auth_login=${credentials.auth_login} and auth_password=crypt(${credentials.auth_password}, auth_password)`
      // const auths: auths[] | null = await prisma.auths.findMany({where: {auth_login: credentials.auth_login, auth_password: `cript(${credentials.auth_password}, auth_password)`}})
      if (!auths?.[0]) return null
      const users: users[] | null = await prisma.$queryRaw`select * from users where auth_id=${auths[0].id}`
      return !users?.[0] ? null : {id: users[0].id.toString(), name: users[0].full_name, login: credentials.auth_login}
    }
  })
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
