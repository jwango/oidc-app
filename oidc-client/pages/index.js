import Head from 'next/head'
import styles from '../styles/Home.module.css'  
import fetch from 'isomorphic-fetch'
import { useState } from 'react';

export default function Home() {

  const [state, setState] = useState({
    userInfo: {},
    games: [],
    hostedGame: '',
    gameIdInput: '',
    currentGame: {},
    currentMoves: [],
    moveIndex: 0,
    lastRes: {},
  });

  function login() {
    const userState = encodeURIComponent(window.location.href);
    const newUrl = `http://localhost:8080/login?state=${userState}`;
    console.log(`redirect to ${newUrl}`);
    window.location.replace(newUrl);
  }

  function getUserInfo() {
    fetch("http://localhost:8080/api/users/myself", { credentials: 'include' })
      .then(res => res.json())
      .then(body => setState({ ...state, userInfo: body, lastRes: body }));
  }

  function getGames() {
    fetch("http://localhost:8080/api/users/myself/games", { credentials: 'include' })
    .then(res => res.json())
    .then(body => setState({ ...state, games: body, lastRes: body }));
  }

  function createGame() {
    fetch("http://localhost:8080/api/users/myself/games", { method: 'POST', credentials: 'include' })
    .then(res => res.json())
    .then(body => setState({ ...state, hostedGame: body, lastRes: body }));
  }

  function refreshGame(gameId) {
    fetch(`http://localhost:8080/api/users/myself/games/${gameId}/state`, { credentials: 'include' })
    .then(res => res.json())
    .then(body => setState({ ...state, hostedGame: body, lastRes: body }));
  }

  function startGame(gameId) {
    fetch(`http://localhost:8080/api/users/myself/games/${gameId}/state`, { method: 'PUT', credentials: 'include', body: '{ "state": "RUNNING" }' })
    .then(res => res.json())
    .then(body => setState({ ...state, hostedGame: body, lastRes: body }));
  }

  function createUser() {
    fetch("http://localhost:8080/api/users", { method: 'POST', credentials: 'include' })
    .then(res => res.json())
    .then(body => setState({ ...state, lastRes: body }))
  }

  function registerFor(gameId) {
    fetch(`http://localhost:8080/api/games/${gameId}/registration`, { method: 'POST', credentials: 'include', body: '' })
    .then(res => res.json())
    .then(body => setState({ ...state, lastRes: body }));
  }

  function getGameData(gameId) {
    fetch(`http://localhost:8080/api/users/myself/games/${gameId}/data`, { credentials: 'include' })
    .then(res => res.json())
    .then(body => setState({ ...state, currentGame: body, lastRes: body }));
  }

  function getMoves(gameId) {
    fetch(`http://localhost:8080/api/users/myself/games/${gameId}/moves`, { credentials: 'include' })
    .then(res => res.json())
    .then(body => setState({ ...state, currentMoves: body, lastRes: body }));
  }

  function makeMove(gameId, moveIndex) {
    fetch(`http://localhost:8080/api/users/myself/games/${gameId}/moves`, { method: 'POST', credentials: 'include', body: JSON.stringify(state.currentMoves[moveIndex]) })
    .then(res => res.json())
    .then(body => setState({ ...state, lastRes: {} }));
  }

  function handleGameIdInput(event) {
    setState({ ...state, gameIdInput: event.target.value });
  }

  function handleMoveInput(event) {
    const moveIndex = Math.min(Math.max(0, event.target.value), state.currentMoves.length - 1);
    setState({ ...state, moveIndex })
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className={styles["state-container"]}>
          <h2>State</h2>
          {renderStateDetails(state, "userInfo")}
          {renderStateDetails(state, "games")}
          {renderStateDetails(state, "hostedGame")}
          {renderStateDetails(state, "gameIdInput", false)}
          {renderStateDetails(state, "currentGame")}
          {renderStateDetails(state, "currentMoves")}
          {renderStateDetails(state, "moveIndex", false)}
          {renderStateDetails(state, "lastRes")}
        </section>
        <section className={styles["controls-container"]}>
          <button onClick={login}>Login!</button>
          <button onClick={createUser}>Create Account</button>
          <button onClick={getUserInfo}>User Info</button>
          <button onClick={getGames}>Get Games</button>
          <button onClick={createGame}>Create Game</button>
          <button onClick={() => refreshGame(state.hostedGame.id)}>Refresh Game Status</button>
        </section>
        <section className={styles["controls-container"]}>
          <label>Game Id:
            <input type="text" value={state.gameIdInput} onChange={handleGameIdInput}></input>
          </label>
          <button onClick={() => startGame(state.gameIdInput)}>Start Game!</button>
          <button onClick={() => registerFor(state.gameIdInput)}>Register For Game</button>
        </section>
        <section className={styles["controls-container"]}>
          <button onClick={() => getGameData(state.gameIdInput)}>Get Game Data</button>
          <button onClick={() => getMoves(state.gameIdInput)}>Get Moves</button>
          <label>Move Index:
            <input type="number" value={state.moveIndex} onChange={handleMoveInput}></input>
          </label>
          <button onClick={() => makeMove(state.gameIdInput, state.moveIndex)}>Make Move</button>
        </section>
      </main>
    </div>
  )
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
