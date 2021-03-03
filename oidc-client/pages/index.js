import Head from 'next/head'
import styles from '../styles/Home.module.css'  
import fetch from 'isomorphic-fetch'
import { Fragment, useState } from 'react';

export async function getStaticProps() {
  return {
    props: {
      gatewayUrl: process.env.GW_URL || "http://localhost:8080"
    },
  }
}

export default function Home({ gatewayUrl }) {

  const gameEnabled = false;

  const initialState ={
    userInfo: {},
    games: [],
    hostedGame: '',
    gameIdInput: '',
    currentGame: {},
    currentMoves: [],
    moveIndex: 0,
    lastRes: {},
    lastErr: {}
  };

  const [state, setState] = useState(initialState);

  function login() {
    const userState = encodeURIComponent(window.location.href);
    const newUrl = `${gatewayUrl}/login?state=${userState}`;
    console.log(`redirect to ${newUrl}`);
    window.location.replace(newUrl);
  }

  function logout() {
    fetch(`${gatewayUrl}/logout`, { credentials: 'include' })
      .then(res => handleFetchResponse(res, false))
      .then(() => setState({ ...initialState, lastRes: "Logged out" }))
      .catch(err => setState({ ...state, lastErr: err }));
  }

  function getUserInfo() {
    fetch(`${gatewayUrl}/api/users/myself`, { credentials: 'include' })
      .then(handleFetchResponse)
      .then(body => setState({ ...state, userInfo: body, lastRes: body }))
      .catch(err => setState({ ...state, lastErr: err }));
  }

  function getGames() {
    fetch(`${gatewayUrl}/api/users/myself/games`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, games: body, lastRes: body }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function createGame() {
    fetch(`${gatewayUrl}/api/users/myself/games`, { method: 'POST', credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, hostedGame: body, lastRes: body }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function refreshGame(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/state`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, hostedGame: body, lastRes: body }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function startGame(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/state`, { method: 'PUT', credentials: 'include', body: '{ "state": "RUNNING" }' })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, hostedGame: body, lastRes: body }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function createUser() {
    fetch(`${gatewayUrl}/api/users`, { method: 'POST', credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, lastRes: body }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function registerFor(gameId) {
    fetch(`${gatewayUrl}/api/games/${gameId}/registration`, { method: 'POST', credentials: 'include', body: '' })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, lastRes: body }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function getGameData(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/data`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, currentGame: body, lastRes: body }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function getMoves(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/moves`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, currentMoves: body, lastRes: body }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function makeMove(gameId, moveIndex) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/moves`, { method: 'POST', credentials: 'include', body: JSON.stringify(state.currentMoves[moveIndex]) })
    .then(handleFetchResponse)
    .then(body => setState({ ...state, lastRes: {} }))
    .catch(err => setState({ ...state, lastErr: err }));
  }

  function handleGameIdInput(event) {
    setState({ ...state, gameIdInput: event.target.value });
  }

  function handleMoveInput(event) {
    const moveIndex = Math.min(Math.max(0, event.target.value), state.currentMoves.length - 1);
    setState({ ...state, moveIndex })
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

  return (
    <div className={styles.container}>
      <Head>
        <title>jwango games</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>{gameEnabled ? "Game Interface" : "User Interface" }</h1>
        <section className={styles["state-container"]}>
          <h2>State</h2>
          {renderStateDetails(state, "userInfo")}
          {condRender(renderStateDetails(state, "games"), gameEnabled)}
          {condRender(renderStateDetails(state, "hostedGame"), gameEnabled)}
          {condRender(renderStateDetails(state, "gameIdInput", false), gameEnabled)}
          {condRender(renderStateDetails(state, "currentGame"), gameEnabled)}
          {condRender(renderStateDetails(state, "currentMoves"), gameEnabled)}
          {condRender(renderStateDetails(state, "moveIndex", false), gameEnabled)}
          {renderStateDetails(state, "lastRes")}
          {renderStateDetails(state, "lastErr", false)}
        </section>
        <section className={styles["controls-container"]}>
          <button onClick={login}>Login!</button>
          <button onClick={logout}>Logout</button>
          <button onClick={createUser}>Create Account</button>
          <button onClick={getUserInfo}>User Info</button>
          {condRender(
          <Fragment>
            <button onClick={getGames}>Get Games</button>
            <button onClick={createGame}>Create Game</button>
            <button onClick={() => refreshGame(state.hostedGame.id)}>Refresh Game Status</button>
          </Fragment>,
          gameEnabled)}
        </section>
        {condRender(
        <section className={styles["controls-container"]}>
          <label>Game Id:
            <input type="text" value={state.gameIdInput} onChange={handleGameIdInput}></input>
          </label>
          <button onClick={() => startGame(state.gameIdInput)}>Start Game!</button>
          <button onClick={() => registerFor(state.gameIdInput)}>Register For Game</button>
        </section>,
        gameEnabled)}
        {condRender(
        <section className={styles["controls-container"]}>
          <button onClick={() => getGameData(state.gameIdInput)}>Get Game Data</button>
          <button onClick={() => getMoves(state.gameIdInput)}>Get Moves</button>
          <label>Move Index:
            <input type="number" value={state.moveIndex} onChange={handleMoveInput}></input>
          </label>
          <button onClick={() => makeMove(state.gameIdInput, state.moveIndex)}>Make Move</button>
        </section>,
        gameEnabled)}
      </main>
    </div>
  )
}

function condRender(component, condition) {
  if (condition) {
    return component;
  } else {
    return null;
  }
}

function renderStateDetails(state, prop, canCollapse = true) {
  if (canCollapse) {
    return (
      <details>
        <summary>{prop}</summary>
        <pre className={styles["state-details"]}>{JSON.stringify(state[prop], null, 2)}</pre>
      </details>
    )
  } else {
    return <pre>{prop}: {JSON.stringify(state[prop])}</pre>
  }
}
