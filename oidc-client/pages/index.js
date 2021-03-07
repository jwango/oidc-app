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

  const gameEnabled = true;

  const initialState ={
    userInfo: {},
    games: [],
    hostedGame: '',
    gamePinInput: '',
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

  function registerFor(gamePin) {
    fetch(`${gatewayUrl}/api/lobby/${gamePin}/registration`, { method: 'POST', credentials: 'include', body: '' })
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

  function handleGameInput({ gameId = state.gameIdInput, pin = state.gamePinInput }) {
    setState({ ...state, gameIdInput: gameId, gamePinInput: pin });
  }

  function handleMoveInput(input) {
    const moveIndex = Math.min(Math.max(0, input), state.currentMoves.length - 1);
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

  function renderGames(games) {
    if (!games) { return null; }
    const gameElements = games.map(game => <li key={game.id}>
      {renderJson(game, false)}
      <button onClick={() => { handleGameInput({ gameId: game.id, pin: game.pin }); } }>Select</button>
    </li>)
    return <ul>{gameElements}</ul>
  }
  
  function renderMoves(moves) {
    if (!moves) { return null; }
    const moveElements = moves.map((move, index) => <li key={index}>
      {renderJson(move)}
      <button onClick={() => handleMoveInput(index)}>Select</button>
    </li>)
    return <ul>{moveElements}</ul>
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
          {condRender(renderStateDetails(state, "games", renderGames), gameEnabled)}
          {condRender(renderStateDetails(state, "hostedGame"), gameEnabled)}
          {condRender(renderStateDetails(state, "currentGame"), gameEnabled)}
          {condRender(renderStateDetails(state, "currentMoves", renderMoves), gameEnabled)}
          {renderState(state, "lastRes")}
          {renderState(state, "lastErr")}
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
          </Fragment>,
          gameEnabled)}
        </section>
        {condRender(
        <section className={styles["controls-container"]}>
          <label>Game Id:
            <input type="text" value={state.gameIdInput} onChange={(event) => handleGameInput({ gameId: event.target.value })}></input>
          </label>
          <button onClick={() => startGame(state.gameIdInput)}>Start Game!</button>
          <label>Game Pin:
            <input type="text" value={state.gamePinInput} onChange={(event) => handleGameInput({ pin: event.target.value }) }></input>
          </label>
          <button onClick={() => registerFor(state.gamePinInput)}>Register For Game</button>
        </section>,
        gameEnabled)}
        {condRender(
        <section className={styles["controls-container"]}>
          <button onClick={() => getGameData(state.gameIdInput)}>Get Game Data</button>
          <button onClick={() => getMoves(state.gameIdInput)}>Get Moves</button>
          <label>Move Index:
            <input type="number" value={state.moveIndex} onChange={(event) => handleMoveInput(event.target.value) }></input>
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

function renderStateDetails(state, prop, renderFn = renderJson) {
  return (
    <details>
      <summary>{prop}</summary>
      <section className={styles["state-details"]}>{renderFn(state[prop])}</section>
    </details>
  )
}

function renderState(state, prop) {
  return <label>{prop}: {renderJson(state[prop], false)}</label>
}

function renderJson(data, formatted = true) {
  return <pre>{JSON.stringify(data, null, formatted ? 2 : null)}</pre>
}
