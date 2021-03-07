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
    gamePinInput: '',
    gameIdInput: ''
  };

  const GAME_STATES = {
    WAITING: 'WAITING',
    RUNNING: 'RUNNING',
    OVER: 'OVER'
  };

  const [state, setState] = useState(initialState);
  const [currentGame, setCurrentGame] = useState({});
  const [currentMoves, setCurrentMoves] = useState([]);
  const [lastRes, setLastRes] = useState({});

  function login() {
    const userState = encodeURIComponent(window.location.href);
    const newUrl = `${gatewayUrl}/login?state=${userState}`;
    console.log(`redirect to ${newUrl}`);
    window.location.replace(newUrl);
  }

  function logout() {
    fetch(`${gatewayUrl}/logout`, { credentials: 'include' })
      .then(res => handleFetchResponse(res, false))
      .then(() => {
        setState({ ...initialState });
        setLastRes("Logged out");
      })
      .catch(err => setLastRes(err));
  }

  function getUserInfo() {
    fetch(`${gatewayUrl}/api/users/myself`, { credentials: 'include' })
      .then(handleFetchResponse)
      .then(body => {
        setState({ ...state, userInfo: body });
        setLastRes(body);
      })
      .catch(err => setLastRes(err));
  }

  function getGames() {
    fetch(`${gatewayUrl}/api/users/myself/games`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      setState({ ...state, games: body });
      setLastRes(body);
    })
    .catch(err => setLastRes(err));
  }

  function createGame() {
    fetch(`${gatewayUrl}/api/users/myself/games`, { method: 'POST', credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      getGames();
      setLastRes(body);
    })
    .catch(err => setLastRes(err));
  }

  function startGame(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/state`, { method: 'PUT', credentials: 'include', body: '{ "state": "RUNNING" }' })
    .then(handleFetchResponse)
    .then(body => {
      getGames();
      if (body.id) {
        getGameData(body.id);
        getMoves(body.id);
      }
      setLastRes(body);
    })
    .catch(err => setLastRes(err));
  }

  function createUser() {
    fetch(`${gatewayUrl}/api/users`, { method: 'POST', credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => setLastRes(body))
    .catch(err => setLastRes(err));
  }

  function registerFor(gamePin) {
    fetch(`${gatewayUrl}/api/lobby/${gamePin}/registration`, { method: 'POST', credentials: 'include', body: '' })
    .then(handleFetchResponse)
    .then(body => {
      getGames();
      setLastRes(body);
    })
    .catch(err => setLastRes(err));
  }

  function getGameData(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/data`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      setCurrentGame(body);
      setLastRes(body);
    })
    .catch(err => setLastRes(err));
  }

  function getMoves(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/moves`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      setCurrentMoves(body);
      setLastRes(body);
    })
    .catch(err => setLastRes(err));
  }

  function makeMove(gameId, moveIndex) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/moves`, { method: 'POST', credentials: 'include', body: JSON.stringify(currentMoves[moveIndex]) })
    .then(res => handleFetchResponse(res, false))
    .then(body => {
      getGameData(gameId);
      getMoves(gameId);
      setLastRes("Move accepted.")
    })
    .catch(err => setLastRes(err));
  }

  function handleGameInput({ gameId = state.gameIdInput, pin = state.gamePinInput }) {
    setState({ ...state, gameIdInput: gameId || "", gamePinInput: pin || "" });
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

  function renderGamesGrouped(games) {
     if (!games) { return null; }
     const gameMap = groupGamesByStatus(games);
     const gameGroupElements = Object.keys(gameMap).map(gameState => <li key={gameState}>
       {renderStateDetails(gameMap[gameState], gameState, renderGames)}
     </li>);
    return <ul>{gameGroupElements}</ul>
  }

  function renderGames(games) {
    if (!games) { return null; }    
    const gameElements = games.map(game => <li key={game.id}>
      {renderJson(game, false)}
      <button onClick={() => { 
        handleGameInput({ gameId: game.id, pin: game.pin });
        if (game.state != GAME_STATES.WAITING) {
          getGameData(game.id);
          getMoves(game.id);
        } else {
          setCurrentGame({});
          setCurrentMoves([]);
        }
      } }>Select</button>
    </li>);
    return <ul>{gameElements}</ul>
  }

  function groupGamesByStatus(games) {
    const gameMap = {};
    games.forEach(game => {
      if (!gameMap[game.state]) { gameMap[game.state] = []; }
      gameMap[game.state].push(game);
    });
    return gameMap;
  }
  
  function renderMoves(moves) {
    if (!moves) { return null; }
    const moveElements = moves.map((move, index) => <li key={index}>
      {renderJson(move)}
      <button onClick={() =>  makeMove(state.gameIdInput, index)}>Make this move</button>
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
          {renderStateDetails(state.userInfo, "userInfo")}
          {condRender(renderStateDetails(state.games, "games", renderGamesGrouped), gameEnabled)}
          {condRender(renderStateDetails(currentGame, "currentGame"), gameEnabled)}
          {condRender(renderStateDetails(currentMoves, "currentMoves", renderMoves), gameEnabled)}
          {renderState(lastRes, "lastRes")}
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

function renderStateDetails(value, label, renderFn = renderJson) {
  return (
    <details>
      <summary>{label}</summary>
      <section className={styles["state-details"]}>{renderFn(value)}</section>
    </details>
  )
}

function renderState(value, label) {
  return <label>{label}: {renderJson(value, false)}</label>
}

function renderJson(data, formatted = true) {
  return <pre>{JSON.stringify(data, null, formatted ? 2 : null)}</pre>
}
