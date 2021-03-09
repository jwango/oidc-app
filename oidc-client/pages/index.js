import styles from '../styles/Home.module.css'  
import fetch from 'isomorphic-fetch'
import Head from 'next/head';
import GameInterface from '../components/game-interface.component';
import { useState } from 'react';
import { renderState, renderStateDetails } from '../utils'
import PubNub, { generateUUID } from 'pubnub';
import { PubNubProvider } from 'pubnub-react';

export async function getStaticProps() {
  return {
    props: {
      gatewayUrl: process.env.GW_URL || "http://localhost:8080"
    },
  }
}

export default function Home({ gatewayUrl }) {

  const initialState ={
    userInfo: null
  };

  const [state, setState] = useState(initialState);
  const [lastRes, setLastRes] = useState({});
  const [pubNub, setPubNub] = useState(null);

  function login() {
    const userState = encodeURIComponent(window.location.href);
    const newUrl = `${gatewayUrl}/login?state=${userState}`;
    console.log(`redirect to ${newUrl}`);
    window.location.replace(newUrl);
  }

  function logout() {
    fetch(`${gatewayUrl}/logout`, { credentials: 'include' })
      .then(res => handleFetchResponse(res, false))
      .then(() => {
        setState({ ...initialState });
        setLastRes("Logged out");
      })
      .catch(err => setLastRes(err));
  }

  function getUserInfo() {
    fetch(`${gatewayUrl}/api/users/myself`, { credentials: 'include' })
      .then(handleFetchResponse)
      .then(body => {
        if (!state.userInfo && body.id) {
          const p = new PubNub({
            subscribeKey: "sub-c-6bb2a544-800d-11eb-8096-3e6ae84b74ea",
            uuid: body.id
          });
          setPubNub(p);
        }
        setState({ ...state, userInfo: body });
        setLastRes(body);
      })
      .catch(err => setLastRes(err));
  }

  function createUser() {
    fetch(`${gatewayUrl}/api/users`, { method: 'POST', credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => setLastRes(body))
    .catch(err => setLastRes(err));
  }

  function handleFetchResponse(res, useJson = true) {
    if (res.ok) {
      if (useJson) {
        return res.json();
      } else {
        return res.text();
      }
    } else {
      throw { status: res.status, statusText: res.statusText, body: res.text() };
    }
  }

  function renderContent() {
    if (state.userInfo && pubNub) {
      return (
        <main className={styles.main}>
          <section className={styles["controls-container"]}>
            <button onClick={logout}>Logout</button>
          </section>
          <PubNubProvider client={pubNub}>
            <GameInterface gatewayUrl={gatewayUrl}></GameInterface>
          </PubNubProvider>
        </main>
      )
    } else {
      return (
        <main className={styles.main}>
          <h1>Login Page</h1>
          <section className={styles["state-container"]}>
            <h2>State</h2>
            {renderStateDetails(state.userInfo, "userInfo")}
            {renderState(lastRes, "lastRes")}
          </section>
          <section className={styles["controls-container"]}>
            <button onClick={login}>Sign-in with Google</button>
            <button onClick={createUser}>Create Account</button>
            <button onClick={getUserInfo}>Login</button>
            <button onClick={logout}>Logout</button>
          </section>
        </main>
      )
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>jwango games</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {renderContent()}
    </div>
  )
}
