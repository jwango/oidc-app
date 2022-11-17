import { useContext } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AppConfigContext } from '../helpers/AppConfigProvider';
import { useSnackbar } from '../helpers/SnackbarContext';
import LobbyInterface from '../components/lobby-interface.component';
import Login from '../components/login.component';
import withLayout from '../components/with-layout';

function Home({ logout, userInfo, setUserInfo }) {

  const { gatewayUrl } = useContext(AppConfigContext);
  const [showSnackbar, dismissSnackbar] = useSnackbar();

  function errHandler(err) {
    if (err.status == 401) {
      logout();
      return;
    }

    let errorMsg = 'The server cannot process that request.'
    if (err.status != 404 && err.status >= 400 && err.status < 500) {
      errorMsg = 'That action is unsupported.';
    } else if (err.status >= 500) {
      errorMsg = 'The server failed to process that request.';
    }
    showSnackbar(errorMsg);
    dismissSnackbar(5000);
  }

  function renderContent() {
    const content = (userInfo)
      ? <LobbyInterface gatewayUrl={gatewayUrl} errHandler={errHandler}></LobbyInterface>
      : <Login gatewayUrl={gatewayUrl} errHandler={errHandler} logoutFn={logout} setUserInfo={setUserInfo}></Login>;
    return (<>{content}</>)
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