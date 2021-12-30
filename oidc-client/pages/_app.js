import fetch from 'isomorphic-fetch';
import { useEffect, useState } from 'react';
import App from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import getConfig from 'next/config';
import { useRouter } from "next/router";
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import { AppConfigContext } from '../helpers/AppConfigProvider';
import { handleFetchResponse, setQueryParams } from '../utils'
import '../styles/sass/main.scss';

function MyApp({ Component, pageProps, appConfig }) {
  const [pubNub, setPubNub] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  const { gatewayUrl } = appConfig;

  useEffect(() => {
    if (userInfo?.id) {
      const p = new PubNub({
          subscribeKey: "sub-c-6bb2a544-800d-11eb-8096-3e6ae84b74ea",
          uuid: userInfo.id
      });
      setPubNub(p);
    } else if (router.route !== "/") {
      window.location.replace("/?signIn=1");
    }
  }, [userInfo]);

  const allProps = {
    ...pageProps,
    logout,
    userInfo,
    setUserInfo
  };

  function logout(queryParams = {}) {
    return fetch(`${gatewayUrl}/logout`, { credentials: 'include' })
      .then(res => handleFetchResponse(res, false))
      .then(() => {
          setUserInfo(null);
          window.location.replace(setQueryParams("/", queryParams));
      })
  }

  function renderPageActions() {
    return (userInfo) ? (<>
      <Link href='/'><a>Lobby</a></Link>
      <button onClick={logout}>Logout</button>
    </>) : null;
  }

  const baseContent = (<>
    <Head>
      <title>jwango games</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <AppConfigContext.Provider value={appConfig}>
      <span className="app--default">
        <div className='container column'>
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
          <Component {...allProps} />
          <hr className="content-wrapper"></hr>
          <footer className='main__footer content-wrapper'>
            <p>Hello! As a disclaimer, this site makes use of 3rd party cookies to maintain your session cookies.
              If you use a browser that blocks such cookies, you won't be able to use this site until you disable that setting or until the session resolver is on the same domain.</p>
          </footer>
        </div>
      </span>
    </AppConfigContext.Provider>
  </>)

  return pubNub
    ? <PubNubProvider client={pubNub}>{baseContent}</PubNubProvider>
    : (router.route === "/" ? <>{baseContent}</> : <p>Redirecting you to login...</p>);
}

MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  const appConfig = getConfig().publicRuntimeConfig;

  return { ...appProps, appConfig }
}

export default MyApp
