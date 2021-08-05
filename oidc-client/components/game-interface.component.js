import styles from '../styles/Game.module.css'  
import fetch from 'isomorphic-fetch'
import { useEffect, useState } from 'react';
import { usePubNub } from 'pubnub-react';
import { renderJson, renderStateDetails } from '../utils'
import Mahjong from './mahjong.component';

export default function GameInterface({ gatewayUrl, errHandler, gameId, backFn }) {

  const adminSecret = "secret"

  const GAME_TYPES = {
      TIC_TAC_TOE: 'TIC_TAC_TOE',
      MAHJONG: 'MAHJONG'
  };

  const MESSAGE_TYPES = {
    MOVE_MADE: 'MOVE_MADE'
  };

  const ROW_TO_LETTER = {
      0: "A",
      1: "B",
      2: "C"
  };

  const mPubNub = usePubNub();

  const [channels, setChannels] = useState(new Set());
  const [messages, setMessages] = useState([]);

  function handleMessage(event) {
    const message = event.message;
    setMessages([...messages, event]);
    if (message.type == MESSAGE_TYPES.MOVE_MADE) {
      getGameData(gameId);
      getMoves(gameId);
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

  const [getURL, setGetURL] = useState("");
  const [currentGame, setCurrentGame] = useState({});
  const [currentMoves, setCurrentMoves] = useState({ pendingMove: null, moves: [] });
  const [lastRes, setLastRes] = useState({});

  useEffect(() => { 
    getGameData(gameId);
    getMoves(gameId);
    setChannels((new Set(channels)).add(gameId));
  }, [gameId])

  function getGameData(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/data`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      setCurrentGame(body);
      setLastRes(body);
    })
    .catch(err => handleErr(err));
  }

  function getMoves(gameId) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/moves`, { credentials: 'include' })
    .then(handleFetchResponse)
    .then(body => {
      setCurrentMoves(body);
      setLastRes(body);
    })
    .catch(err => handleErr(err));
  }

  function makeMoveByIndex(gameId, moveIndex) {
    return makeMove(gameId, currentMoves.moves[moveIndex])
  }

  function makeMove(gameId, move) {
    fetch(`${gatewayUrl}/api/users/myself/games/${gameId}/moves`, { method: 'POST', credentials: 'include', body: JSON.stringify(move) })
    .then(res => handleFetchResponse(res, false))
    .then(body => {
      getGameData(gameId);
      getMoves(gameId);
      setLastRes("Move accepted.")
    })
    .catch(err => handleErr(err));
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
  
  function renderMoves(moves) {
    if (!moves) { return null; }
    const moveElements = moves.map((move, index) => <li key={index}>
      {renderMove(move)}
      <button onClick={() => makeMoveByIndex(gameId, index)}>Make this move</button>
    </li>)
    return <ul>{moveElements}</ul>
  }

  function renderMove(move) {
      if (move?.gameType === GAME_TYPES.TIC_TAC_TOE) {
          return (
            <span style={ { "margin-right": "16px" } }>[{ROW_TO_LETTER[move.moveInfo.row]}, {move.moveInfo.column}]</span>
          );
      } else {
          return renderJson(move);
      }
  }

  function renderGameData(gameData) {
      if (gameData.type === GAME_TYPES.TIC_TAC_TOE && gameData.data) {
          return renderTicTacToeGameData(gameData);
      } else {
          return renderJson(gameData);
      }
  }

  function renderGame(gameDataAndMoves) {
    if (gameDataAndMoves.gameData.type == GAME_TYPES.MAHJONG) {
     return <Mahjong gameData={gameDataAndMoves.gameData} movesInfo={gameDataAndMoves.movesInfo} submitMoveFn={(move) => makeMove(gameId, move)}></Mahjong>
    } else {
      return <div>
        {renderGameData(gameDataAndMoves.gameData)}
        {renderMoves(gameDataAndMoves.movesInfo.moves)}
      </div>
    }
  }

  function renderTicTacToeGameData(gameData) {
    const board = gameData.data.board;
    const winner = gameData.data.winner || "none";
    const boardStr = " |0|1|2|\n--------\n" + board.map((row, i) => ROW_TO_LETTER[i] + "|" + row.map(cell => cell || " ").join("|") + "|").join("\n-------\n");
    return (
      <div>
          <pre>{boardStr}</pre>
          <label>winner? {winner}</label>
      </div>
    );
  }

  function makeRequest(url) {
    const reqBody = encodeURIComponent("ADMIN-SECRET") + "=" + encodeURIComponent(adminSecret);
    fetch(`${gatewayUrl}/${url}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: reqBody })
    .then(handleFetchResponse)
    .then(body => {
      setLastRes(body);
    })
    .catch(err => setLastRes(err));
  }

  return (
    <section style={ { "width": "100%" } }>
        <h1>{ "Game Interface" }</h1>
        <section className={styles["state-container"]}>
          {/*renderStateDetails(messages, "messages")*/}
          {renderGame({ gameData: currentGame, movesInfo: currentMoves })}
        </section>
        <section className={styles["controls-container"]}>
          <button onClick={() => getGameData(gameId)}>Get Game Data</button>
          <button onClick={() => getMoves(gameId)}>Get Moves</button>
          <button onClick={() => backFn()}>Back to Lobby</button>
        </section>
        {/* <section className={styles["controls-container"]}>
          <input type="text" value={getURL} onChange={(event) => setGetURL(event.target.value)}></input>
          <button onClick={() => makeRequest(getURL)}>REQUEST</button>
        </section>
        <section className={styles["state-container"]}>
          {renderJson(lastRes)}
        </section> */}
    </section>
  )
}
