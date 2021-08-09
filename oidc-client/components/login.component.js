import sharedStyles from '../styles/Shared.module.css'
import { Fragment, useEffect, useState } from 'react';
import { handleFetchResponse, getQueryParams, setQueryParams } from '../utils';

export default function Login({ gatewayUrl, logoutFn, setUserInfo }) {

    const LOGIN_STATES = {
        LOGGED_OUT: 'LOGGED_OUT',
        ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
        ACCOUNT_FOUND: 'ACCOUNT_FOUND'
    };

    const [lastRes, setLastRes] = useState({});
    const [loginState, setLoginState] = useState(LOGIN_STATES.LOGGED_OUT);

    useEffect(() => {
        const queryParams = getQueryParams(window.location.href);
    
        if (queryParams["loggedIn"] === "true") {
            getUserInfo().catch(err => {
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
        getUserInfo().catch(err => {
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
                setUserInfo(body);
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

    let buttons = null;
    if (loginState === LOGIN_STATES.LOGGED_OUT) {
        buttons = <button onClick={handleSigninButton}>Sign-in (Google)</button>
    } else if (loginState === LOGIN_STATES.ACCOUNT_NOT_FOUND) {
        buttons = (<Fragment>
            <button onClick={createUser}>Create Account</button>
            <button onClick={logoutFn}>Logout</button>
        </Fragment>)
    } else if (loginState === LOGIN_STATES.ACCOUNT_FOUND) {
        buttons = <button onClick={logoutFn}>Logout</button>
    }
      
    return (<section>
        <h1>Login</h1>
        <section className={sharedStyles["controls-container"]}>
            {buttons}
        </section>
    </section>)
}