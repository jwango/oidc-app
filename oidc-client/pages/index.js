import { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AppConfigContext } from '../helpers/AppConfigProvider';
import LobbyInterface from '../components/lobby-interface.component';
import Login from '../components/login.component';
import withLayout from '../components/with-layout';

function Home({ logout, userInfo, setUserInfo }) {

  const { gatewayUrl } = useContext(AppConfigContext);
  const { locale } = useRouter();

  function errHandler(err) {
    if (err.status == 401) {
      logout();
    }
  }

  function renderContent() {
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    const content = (userInfo)
      ? <LobbyInterface gatewayUrl={gatewayUrl} errHandler={errHandler}></LobbyInterface>
      : <Login gatewayUrl={gatewayUrl} errHandler={errHandler} logoutFn={logout} setUserInfo={setUserInfo}></Login>;
    return (<><Link href='' locale={nextLocale}><a>Switch to {nextLocale}</a></Link>{content}</>)
  }

  return (
    <main className='content-wrapper'>{renderContent()}</main>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'lobby', 'login']))
    }
  };
}

export default withLayout(Home);