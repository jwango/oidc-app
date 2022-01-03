import styles from '../styles/Shared.module.css'  
import fetch from 'isomorphic-fetch'
import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '../helpers/AppConfigProvider';
import { handleFetchResponse } from '../utils';

export default function LobbyInterface({ errHandler }) {

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

  const { t } = useTranslation('lobby');
  const tCommon = useTranslation('common').t;
  const [state, setState] = useState(initialState);
  const [lastRes, setLastRes] = useState({});
  const { gatewayUrl } = useContext(AppConfigContext);

  useEffect(() => {
    getGames();
  }, [gatewayUrl])

  function getGames() {
    fetch(`${gatewayUrl}/api/users/myself/games`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      setLastRes(body);
      setState({ ...state, games: body });
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

  function handleErr(err) {
    errHandler(err);
    setLastRes(err);
  }

  function getGameLink(game) {
    let gameHref = null;
    if (game.type === GAME_TYPES.MAHJONG) {
      gameHref = `/mahjong/${game.id}`;
    } else if (game.type === GAME_TYPES.TIC_TAC_TOE) {
      gameHref = `/tictactoe/${game.id}`;
    }

    return gameHref && <Link href={gameHref}><button>{t('enter')}</button></Link>;
  }

  function renderGamesTable(games) {
    const gameRows = (games || [])
        .filter((game) => !!state.activeOnly ? game.state !== GAME_STATES.OVER : true)
        .sort((a, b) => a.state.localeCompare(b.state))
        .map(game => {
            let action = <td></td>;
            if (game.state === GAME_STATES.WAITING) {
                if (game.canStart) {
                  action = <td><button onClick={() => startGame(game.id)}>{t('start')}</button></td>
                }
            } else  {
                action = <td>{getGameLink(game)}</td>
            }
            return <tr key={game.id}>
                {action}
                <td>{game.name || ""}</td>
                <td>{tCommon(`gameTypes.${game.type}`)}</td>
                <td>{tCommon(`gameStates.${game.state}`)}</td>
                <td>{game.playerIds?.length}</td>
                <td>{game.pin || ""}</td>
            </tr>
        })
    if (!gameRows?.length) { return <p>{t('noGames')}</p>; }
    return <table>
        <thead>
            <tr>  
                <th>{t('action')}</th>
                <th>{t('name')}</th>
                <th>{t('type')}</th>
                <th>{t('state')}</th>
                <th></th>
                <th>{t('pin')}</th>
            </tr>
        </thead>
        <tbody>
            {gameRows}
        </tbody>
    </table>
  }

  function renderGameTypesSelect() {
      const options = Object.keys(GAME_TYPES).map(gameType => <option key={gameType} value={GAME_TYPES[gameType]}>
          {tCommon(`gameTypes.${GAME_TYPES[gameType]}`)}
      </option>)
      return  <select id="gameTypes" name="gameTypes" onChange={(event) => handleGameInput({ gameType: event.target.value })}>{options}</select>
  }

  return (
    <section>
        <h1>{tCommon('nav.lobby')}</h1>
        <section className={styles["layout__container"]}>
          <section className={styles["layout__column"] + " " + styles["layout__column--wide"]}>
            <h2>{t('games')}</h2>
            <section className={styles["controls-container"]}>
              <input type="checkbox" id="activeGame" name="activeOnly" checked={state.activeOnly} onChange={() => setState({ ...state, activeOnly: !state.activeOnly })}></input>
              <label htmlFor="activeOnly">{t('active')}</label>
              <button onClick={getGames}>{tCommon('refresh')}</button>
            </section>
            <section className={styles["state-container"] + " " + styles["content__wide"]}>
              {renderGamesTable(state.games)}
            </section>
          </section>
          <section className={styles["layout__column"] + " " + styles["layout__column--skinny"]}>
            <h2>{t('host')}</h2>
              <section className={styles["controls-container"]}>
                <label htmlFor="gameTypes">{t('type')}</label>
                {renderGameTypesSelect()}
                <button onClick={() => createGame(state.createGameType)}>{t('newGame')}</button>
              </section>
            <h2>{t('join')}</h2>
            <section className={styles["controls-container"]}>
              <label htmlFor="pinInput">{t('pin')}</label>
              <input name="pinInput" type="text" value={state.gamePinInput} onChange={(event) => handleGameInput({ pin: event.target.value }) }></input>
              <button onClick={() => registerFor(state.gamePinInput)}>{t('register')}</button>
            </section>
          </section>
        </section>
    </section>
  )
}
