import { Fragment, useContext } from 'react';
import { AppConfigContext } from '../helpers/AppConfigProvider';
import LobbyInterface from '../components/lobby-interface.component';
import Login from '../components/login.component';

export default function Home({ logout, userInfo, setUserInfo }) {

  const { gatewayUrl } = useContext(AppConfigContext);

  function errHandler(err) {
    if (err.status == 401) {
      logout();
    }
  }

  function renderContent() {
    const content = (userInfo)
      ? <LobbyInterface gatewayUrl={gatewayUrl} errHandler={errHandler}></LobbyInterface>
      : <Login gatewayUrl={gatewayUrl} errHandler={errHandler} logoutFn={logout} setUserInfo={setUserInfo}></Login>;
    return (<Fragment>{content}</Fragment>)
  }

  return (
    <main className='content-wrapper'>{renderContent()}</main>
  )
}
