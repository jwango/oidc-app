import styles from '../styles/Shared.module.css'  
import fetch from 'isomorphic-fetch'
import { useEffect, useState } from 'react';

export default function LobbyInterface({ gatewayUrl, errHandler, setCurrentGameId, logoutFn }) {

  const GAME_STATES = {
    WAITING: 'WAITING',
    RUNNING: 'RUNNING',
    OVER: 'OVER'
  };

  const GAME_TYPES = {
      TIC_TAC_TOE: 'TIC_TAC_TOE',
      MAHJONG: 'MAHJONG'
  };

  const initialState = {
    games: [],
    gamePinInput: '',
    createGameType: GAME_TYPES.TIC_TAC_TOE,
    activeOnly: true
  };

  const [state, setState] = useState(initialState);
  const [lastRes, setLastRes] = useState({});

  useEffect(() => {
    getGames();
  }, [gatewayUrl])

  function getGames() {
    fetch(`${gatewayUrl}/api/users/myself/games`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      setState({ ...state, games: body });
      setLastRes(body);
    })
    .catch(err => handleErr(err));
  }

  function createGame(gameType = GAME_TYPES.TIC_TAC_TOE) {
    const params = new URLSearchParams({ type: gameType });
    fetch(`${gatewayUrl}/api/users/myself/games?${params}`, { method: 'POST', credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      getGames();
      setLastRes(body);
    })
    .catch(err => handleErr(err));
  }

  function startGame(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/state`, { method: 'PUT', credentials: 'include', body: '{ "state": "RUNNING" }' })
    .then(handleFetchResponse)
    .then(body => {
      getGames();
      setLastRes(body);
    })
    .catch(err => handleErr(err));
  }

  function registerFor(gamePin) {
    fetch(`${gatewayUrl}/api/lobby/${gamePin}/registration`, { method: 'POST', credentials: 'include', body: '' })
    .then(handleFetchResponse)
    .then(body => {
      getGames();
      setLastRes(body);
    })
    .catch(err => handleErr(err));
  }

  function handleGameInput({ pin = state.gamePinInput, gameType = state.createGameType }) {
    setState({ ...state, gamePinInput: pin || "", createGameType: gameType || GAME_TYPES.TIC_TAC_TOE });
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

  function handleErr(err) {
    errHandler(err);
    setLastRes(err);
  }

  function renderGamesTable(games) {
    const gameRows = (games || [])
        .filter((game) => !!state.activeOnly ? game.state !== GAME_STATES.OVER : true)
        .sort((a, b) => a.state.localeCompare(b.state))
        .map(game => {
            let action = <td></td>;
            if (game.state === GAME_STATES.WAITING) {
                if (game.canStart) {
                  action = <td><button onClick={() => startGame(game.id)}>Start</button></td>
                }
            } else  {
                action = <td><button onClick={() => setCurrentGameId(game.id)}>Enter</button></td>
            }
            return <tr key={game.id}>
                <td>{game.name || ""}</td>
                <td>{game.type}</td>
                <td>{game.state}</td>
                <td>{game.playerIds?.length}</td>
                <td>{game.pin || ""}</td>
                {action}
            </tr>
        })
    if (!gameRows?.length) { return <p>No games to show</p>; }
    return <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Type</th>
                <th>State</th>
                <th></th>
                <th>PIN</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {gameRows}
        </tbody>
    </table>
  }

  function renderGameTypesSelect() {
      const options = Object.keys(GAME_TYPES).map(gameType => <option key={gameType} value={GAME_TYPES[gameType]}>
          {GAME_TYPES[gameType]}
      </option>)
      return  <select id="gameTypes" name="gameTypes" onChange={(event) => handleGameInput({ gameType: event.target.value })}>{options}</select>
  }

  return (
    <section>
        <h1>Lobby</h1>
        <section className={styles["controls-container"]}>
          <input type="checkbox" id="activeGame" name="activeOnly" checked={state.activeOnly} onChange={() => setState({ ...state, activeOnly: !state.activeOnly })}></input>
          <label for="activeOnly">Show Active Only</label>
          <button onClick={getGames}>Refresh</button>
          <button onClick={logoutFn}>Logout</button>
        </section>
        <section className={styles["state-container"]}>
          {renderGamesTable(state.games)}
        </section>
        <section className={styles["controls-container"]}>
          {renderGameTypesSelect()}
          <label for="gameTypes">Type</label>
          <button onClick={() => createGame(state.createGameType)}>New Game</button>
        </section>
        <section className={styles["controls-container"]}>
          <input name="pinInput" type="text" value={state.gamePinInput} onChange={(event) => handleGameInput({ pin: event.target.value }) }></input>
          <label for="pinInput">PIN</label>
          <button onClick={() => registerFor(state.gamePinInput)}>Register</button>
        </section>
    </section>
  )
}
