import fetch from 'isomorphic-fetch';
import Head from 'next/head';
import Link from 'next/link';
import GameInterface from '../components/game-interface.component';
import { Fragment, useEffect, useState } from 'react';
import { handleFetchResponse, setQueryParams } from '../utils'
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import LobbyInterface from '../components/lobby-interface.component';
import Login from '../components/login.component';

export async function getStaticProps() {
  return {
    props: {
      gatewayUrl: process.env.GW_URL || "http://localhost:8080"
    },
  }
}

export default function Home({ gatewayUrl }) {

  const [currentGameId, setCurrentGameId] = useState(null);
  const [pubNub, setPubNub] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (userInfo?.id) {
      const p = new PubNub({
          subscribeKey: "sub-c-6bb2a544-800d-11eb-8096-3e6ae84b74ea",
          uuid: userInfo.id
      });
      setPubNub(p);
    }
  }, [userInfo])


  function logout(queryParams = {}) {
    return fetch(`${gatewayUrl}/logout`, { credentials: 'include' })
      .then(res => handleFetchResponse(res, false))
      .then(() => {
          setUserInfo(null);
          window.location.replace(setQueryParams(window.location.href, queryParams));
      })
  }

  function errHandler(err) {
    if (err.status == 401) {
      logout();
    }
  }

  function renderPageActions() {
    const pageActions = [];
    if (userInfo && pubNub) {
      pageActions.push({ name: "Logout", callback: logout });
      if (!!currentGameId) {
        pageActions.push({ name: "Lobby", callback: () => setCurrentGameId(null) });
      }
    }
    return pageActions.map(action => {
      return (<button key={action.name} onClick={() => action.callback()}>{action.name}</button>);
    });
  }

  function renderContent() {
    const content = (userInfo && pubNub) ? (
      !!currentGameId
      ? <PubNubProvider client={pubNub}><GameInterface gatewayUrl={gatewayUrl} errHandler={errHandler} gameId={currentGameId} backFn={() => setCurrentGameId(null)}></GameInterface></PubNubProvider>
      : <LobbyInterface gatewayUrl={gatewayUrl} setCurrentGameId={setCurrentGameId} logoutFn={logout}></LobbyInterface>
    ) : (
      <Login gatewayUrl={gatewayUrl} errHandler={errHandler} logoutFn={logout} setUserInfo={setUserInfo}></Login>
    )
    return (<Fragment>
        {content}
    </Fragment>)
  }

  return (
    <Fragment>
      <Head>
        <title>jwango games</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className='main__header'>
        <div className='content-wrapper'>
          <h1>JWANGO</h1>
        </div>
      </header>
      <nav>
        <div className='content-wrapper'>
          <Link href='https://www.jwango.com'><a>Blog</a></Link>
          {renderPageActions()}
        </div>
      </nav>
      <main className='content-wrapper'>{renderContent()}</main>
    </Fragment>
  )
}
