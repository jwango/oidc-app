import styles from '../styles/Game.module.css'  
import fetch from 'isomorphic-fetch'
import { useEffect, useState } from 'react';
import { usePubNub } from 'pubnub-react';
import { renderJson, renderState, renderStateDetails } from '../utils'

export default function GameInterface({ gatewayUrl }) {

  const gameEnabled = true;

  const initialState = {
    games: [],
    gamePinInput: '',
    gameIdInput: ''
  };

  const GAME_STATES = {
    WAITING: 'WAITING',
    RUNNING: 'RUNNING',
    OVER: 'OVER'
  };

  const MESSAGE_TYPES = {
    MOVE_MADE: 'MOVE_MADE'
  };

  const mPubNub = usePubNub();

  const [channels, setChannels] = useState(new Set());
  const [messages, setMessages] = useState([]);

  function handleMessage(event) {
    const message = event.message;
    setMessages([...messages, event]);
    if (message.type == MESSAGE_TYPES.MOVE_MADE) {
      getGameData(state.gameIdInput);
      getMoves(state.gameIdInput);
    }
  }

  useEffect(() => {
    const newChannels = Array.from(channels.values());
    if (newChannels.length > 0) {
      console.log("subscribing to " + newChannels);
      mPubNub.addListener({ message: handleMessage });
      mPubNub.subscribe({ channels: newChannels });
    }
  }, [mPubNub, channels]);

  const [state, setState] = useState(initialState);
  const [currentGame, setCurrentGame] = useState({});
  const [currentMoves, setCurrentMoves] = useState([]);
  const [lastRes, setLastRes] = useState({});

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
        setChannels((new Set(channels)).add(body.id));
      }
      setLastRes(body);
    })
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
          setChannels((new Set(channels)).add(game.id));
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
    <section style={ { "width": "100%" } }>
        <h1>{gameEnabled ? "Game Interface" : "User Interface" }</h1>
        <section className={styles["state-container"]}>
          <h2>State</h2>
          {renderStateDetails(messages, "messages")}
          {renderStateDetails(state.games, "games", renderGamesGrouped)}
          {renderStateDetails(currentGame, "currentGame")}
          {renderStateDetails(currentMoves, "currentMoves", renderMoves)}
          {renderState(lastRes, "lastRes")}
        </section>
        <section className={styles["controls-container"]}>
        <button onClick={getGames}>Get Games</button>
        <button onClick={createGame}>Create Game</button>
        </section>
        <section className={styles["controls-container"]}>
          <label>Game Id:
            <input type="text" value={state.gameIdInput} onChange={(event) => handleGameInput({ gameId: event.target.value })}></input>
          </label>
          <button onClick={() => startGame(state.gameIdInput)}>Start Game!</button>
          <label>Game Pin:
            <input type="text" value={state.gamePinInput} onChange={(event) => handleGameInput({ pin: event.target.value }) }></input>
          </label>
          <button onClick={() => registerFor(state.gamePinInput)}>Register For Game</button>
        </section>
        <section className={styles["controls-container"]}>
          <button onClick={() => getGameData(state.gameIdInput)}>Get Game Data</button>
          <button onClick={() => getMoves(state.gameIdInput)}>Get Moves</button>
        </section>
    </section>
  )
}
