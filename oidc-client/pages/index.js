import Head from 'next/head'
import styles from '../styles/Home.module.css'  
import fetch from 'isomorphic-fetch'
import { useState } from 'react';

export default function Home() {

  const [state, setState] = useState({
    config: {}
  });

  function login() {
    fetch("http://localhost:8080/login")
      .then((res) => res.json())
      .then((body) => setState({ config: body }));
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <h2>Config</h2>
        <pre>{JSON.stringify(state.config, null, 2)}</pre>
        <button onClick={login}>Login!</button>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
