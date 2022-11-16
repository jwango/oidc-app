import { useEffect, useState } from 'react';
import { appWithTranslation } from 'next-i18next';
import App from 'next/app';
import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from "next/router";
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import useStickyState from '../helpers/useStickyState';
import { AppConfigContext } from '../helpers/AppConfigProvider';
import '../styles/sass/main.scss';
import { handleFetchResponse, setQueryParams } from '../utils';

function MyApp({ Component, pageProps, appConfig }) {
  const [pubNub, setPubNub] = useState(null);
  const [userInfo, setUserInfo] = useStickyState(null, 'USER_INFO');
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

  function logout(queryParams = {}) {
    return fetch(`${gatewayUrl}/logout`, { credentials: 'include' })
      .then(res => handleFetchResponse(res, false))
      .then(() => {
        setUserInfo(null);
        window.location.replace(setQueryParams("/", queryParams));
      })
      .catch(console.log);
  }

  const allProps = {
    ...pageProps,
    logout,
    userInfo,
    setUserInfo
  };

  const themeColor = '#666699';

  const baseContent = (<>
    <Head>
      <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      <meta name='theme-color' content={themeColor} />
      <link rel='manifest' href='/manifest.json' />
      <title>jwango games</title>

      <meta name='mobile-web-app-capable' content='yes'></meta>
      <link rel='icon' type='image/png' href='/favicon.ico' sizes='16x16' />
      <link rel='icon' type='image/png' href='/favicon.ico' sizes='24x24' />
      <link rel='icon' type='image/png' href='/favicon.ico' sizes='32x32' />
      <link rel='icon' type='image/png' href='/favicon.ico' sizes='64x64' />
      <link rel='apple-touch-icon' href='/app-icon.png' />
      <link rel='mask-icon' href='/mask-icon.svg' color={themeColor}/>
      <link rel='shortcut icon' href='/app-icon.png' />
    </Head>
    <AppConfigContext.Provider value={appConfig}>
      <Component {...allProps} />
    </AppConfigContext.Provider>
  </>)

  return pubNub
    ? <PubNubProvider client={pubNub}>{baseContent}</PubNubProvider>
    : (router.route === "/" ? <>{baseContent}</> : null);
}

MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  const appConfig = getConfig().publicRuntimeConfig;

  return { ...appProps, appConfig }
}

export default appWithTranslation(MyApp);
