import sharedStyles from '../styles/Shared.module.css'
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { handleFetchResponse, getQueryParams, setQueryParams } from '../utils';

export default function Login({ gatewayUrl, logoutFn, setUserInfo }) {
    const { t } = useTranslation('login');
  
    const LOGIN_STATES = {
        LOGGED_OUT: 'LOGGED_OUT',
        ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
        ACCOUNT_FOUND: 'ACCOUNT_FOUND'
    };

    const [loading, setLoading] = useState(false);
    const [lastRes, setLastRes] = useState({});
    const [loginState, setLoginState] = useState(LOGIN_STATES.LOGGED_OUT);

    useEffect(() => {
        const queryParams = getQueryParams(window.location.href);
    
        if (queryParams["loggedIn"] === "true") {
            setLoading(true);
            getUserInfo().catch(err => {
                setLoading(false);
                if (err.status == 404) {
                    setLastRes("Looks like you don't have an account! Create an account to proceed.");
                    setLoginState(LOGIN_STATES.ACCOUNT_NOT_FOUND);
                }
            });
        } else if (queryParams["signIn"] != null) {
            const attempts = +queryParams["signIn"];
            if (!isNaN(attempts) && attempts < 4) {
                signin();
            }
        }
    }, [])

    function handleSigninButton() {
        window.location.replace(setQueryParams(window.location.href, { "signIn": "1" }));
    }

    function signin() {
        setLoading(true);
        getUserInfo()
            .then(() => { setLoading(false); })
            .catch(err => {
                setLoading(false);
                console.log(err);
                if (err.status === 401) {
                    login();
                } else if (err.status === 404) {
                    const queryParams = getQueryParams(window.location.href);
                    const attempts = +(queryParams["signIn"] || 0) + 1;
                    logoutFn({ "signIn": `${attempts}` });
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

    function getUserInfo() {
        return fetch(`${gatewayUrl}/api/users/myself`, { credentials: 'include' })
            .then(handleFetchResponse)
            .then(body => {
                setLoginState(LOGIN_STATES.ACCOUNT_FOUND);
                setLastRes(body);
                setUserInfo(body);
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

    let buttons = null;
    let text = t('letsPlay');
    if (loginState === LOGIN_STATES.LOGGED_OUT) {
        buttons = <button onClick={handleSigninButton}>{t('signIn')}</button>;
    } else if (loginState === LOGIN_STATES.ACCOUNT_NOT_FOUND) {
        buttons = (<Fragment>
            <button onClick={createUser}>{t('createAccount')}</button>
            <button onClick={logoutFn}>{t('nevermind')}</button>
        </Fragment>);
        text = t('newPrompt');
    } else if (loginState === LOGIN_STATES.ACCOUNT_FOUND) {
        buttons = <button onClick={logoutFn}>{t('logout')}</button>
    }
    if (loading) { 
        text = t('loading');
        buttons = null;
    };
      
    return (<section>
        <h1>{t('login')}</h1>
        <p>{text}</p>
        <section className={sharedStyles["controls-container"]}>
            {buttons}
        </section>
    </section>)
}