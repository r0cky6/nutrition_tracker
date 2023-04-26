import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import styles from "./index.module.css";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import Link from "next/link";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div style={{maxWidth: 'min(1400px, 70vw)', margin: '0 auto'}}>
        <div style={{display: 'grid', gridAutoFlow: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
          <Link href='/'>Home</Link>
          <AuthWidget />
        </div>
        <hr/>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

const AuthWidget: React.FC = () => {
  const { data: sessionData } = useSession();
  
  return (
    <div className={styles.authContainer}>
      <p className={styles.showcaseText}>
        {sessionData && <span>Hello, {sessionData.user?.name}!</span>}
      </p>
      {
        
          sessionData 
          ?  <button onClick={()=> void signOut()}>Sign out</button>
          :  <>
                <button onClick={() => void signIn()}>Sign in</button> or 
                <Link href='/signup'>Sign up</Link>
              </>
      }
    </div>
  );
};

export default api.withTRPC(MyApp);
