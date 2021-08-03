import styles from '../styles/Home.module.css'  
import fetch from 'isomorphic-fetch'
import Head from 'next/head';
import GameInterface from '../components/game-interface.component';
import { useEffect, useState } from 'react';
import { renderState, renderStateDetails } from '../utils'
import PubNub, { generateUUID } from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import LobbyInterface from '../components/lobby-interface.component';

export async function getStaticProps() {
  return {
    props: {
      gatewayUrl: process.env.GW_URL || "http://localhost:8080"
    },
  }
}

export default function Home({ gatewayUrl }) {

  function getQueryParams(url) {
    const queryParams = (window.location.href.split("?")[1] || "").split("#")[0].split("&").reduce((acc, val) => {
      const mapping = val.split("=");
      if (mapping.length == 2) { acc[mapping[0]] = mapping[1]; }
      return acc;
    }, {});
    return queryParams;
  }

  function setQueryParams(url, paramsMap) {
    const baseUrl = url.split("?")[0];
    const queriesUri = Object.keys(paramsMap).reduce((acc, queryKey) => {
      if (!paramsMap[queryKey]) { return acc; }
      return [...acc, queryKey + "=" + paramsMap[queryKey]];
    }, []);
    if (queriesUri.length > 0) { return baseUrl + "?" + queriesUri.join("&"); }
    return baseUrl;
  }

  useEffect(() => {
    const queryParams = getQueryParams(window.location.href);

    if (queryParams["loggedIn"] === "true") {
      getUserInfo().catch(err => {
        if (err.status == 404) {
          setLastRes("Looks like you don't have an account! Create an account to proceed.");
        }
      });
    } else if (queryParams["signIn"] != null) {
      const attempts = +queryParams["signIn"];
      if (!isNaN(attempts) && attempts < 4) {
        signin();
      }
    }
  }, [])

  const initialState ={
    userInfo: null
  };

  const [currentGameId, setCurrentGameId] = useState({});
  const [state, setState] = useState(initialState);
  const [lastRes, setLastRes] = useState({});
  const [pubNub, setPubNub] = useState(null);

  function handleSigninButton() {
    window.location.replace(setQueryParams(window.location.href, { "signIn": "1" }));
  }

  function signin() {
    getUserInfo().catch(err => {
      console.log(err);
      if (err.status === 401) {
        login();
      } else if (err.status === 404) {
        const queryParams = getQueryParams(window.location.href);
        const attempts = +(queryParams["signIn"] || 0) + 1;
        logout({ "signIn": `${attempts}` });
      }
    });
  }

  function login() {
    const queryParams = getQueryParams(window.location.href);
    const newHref = setQueryParams(window.location.href, { ...queryParams, "loggedIn": "true" });
    const userState = encodeURIComponent(newHref);
    const newUrl = `${gatewayUrl}/login?state=${userState}`;
    console.log(`redirect to ${newUrl}`);
    window.location.replace(newUrl);
  }

  function logout(queryParams = {}) {
    return fetch(`${gatewayUrl}/logout`, { credentials: 'include' })
      .then(res => handleFetchResponse(res, false))
      .then(() => {
        setState({ ...initialState });
        setLastRes("Logged out");
        window.location.replace(setQueryParams(window.location.href, queryParams));
      })
      .catch(err => setLastRes(err));
  }

  function getUserInfo() {
    return fetch(`${gatewayUrl}/api/users/myself`, { credentials: 'include' })
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
      .catch(err => { setLastRes(err); throw err });
  }

  function createUser() {
    fetch(`${gatewayUrl}/api/users`, { method: 'POST', credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      getUserInfo();
      setLastRes(body);
    })
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

  function errHandler(err) {
    if (err.status == 401) {
      logout();
    }
  }

  function renderContent() {
    const self = this;
    if (state.userInfo && pubNub) {
      return (
        <main className={styles.main}>
          <section className={styles["controls-container"]}>
            <button onClick={logout}>Logout</button>
          </section>
          <LobbyInterface gatewayUrl={gatewayUrl} errHandler={errHandler} setCurrentGameId={setCurrentGameId}></LobbyInterface>
          {/* <PubNubProvider client={pubNub}>
            <GameInterface gatewayUrl={gatewayUrl} errHandler={errHandler}></GameInterface>
          </PubNubProvider> */}
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
            <button onClick={handleSigninButton}>Sign-in with Google</button>
            <button onClick={createUser}>Create Account</button>
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
