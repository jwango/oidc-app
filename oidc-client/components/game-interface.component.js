import styles from '../styles/Shared.module.css'  
import fetch from 'isomorphic-fetch'
import { useEffect, useState } from 'react';
import { usePubNub } from 'pubnub-react';
import Mahjong from '../features/mahjong/mahjong.component';
import GeneralGame from './general-game.component';
import TicTacToe from './tictactoe.component';
import { handleFetchResponse } from '../utils'

export default function GameInterface({ gatewayUrl, errHandler, gameId, backFn }) {

  const adminSecret = "secret"

  const GAME_TYPES = {
      TIC_TAC_TOE: 'TIC_TAC_TOE',
      MAHJONG: 'MAHJONG'
  };

  const MESSAGE_TYPES = {
    MOVE_MADE: 'MOVE_MADE'
  };

  const mPubNub = usePubNub();

  const [loaded, setLoaded] = useState(false);
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
      setLoaded(true);
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

  function refresh(gameId) {
    getGameData(gameId);
    getMoves(gameId);
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

  function handleErr(err) {
    errHandler(err);
    setLastRes(err);
  }

  function goBack() {
    mPubNub.unsubscribeAll();
    backFn();
  }

  function renderGame(gameDataAndMoves) {
    if (loaded) {
      if (gameDataAndMoves.gameData.type === GAME_TYPES.MAHJONG) {
        return <Mahjong
         gameData={gameDataAndMoves.gameData}
         movesInfo={gameDataAndMoves.movesInfo}
         submitMoveFn={(move) => makeMove(gameId, move)}
         refreshFn={() => refresh(gameId)}
       ></Mahjong>
       } else if (gameDataAndMoves.gameData.type === GAME_TYPES.TIC_TAC_TOE) {
         return <TicTacToe
           gameData={gameDataAndMoves.gameData}
           movesInfo={gameDataAndMoves.movesInfo}
           submitMoveFn={(move) => makeMove(gameId, move)}
           refreshFn={() => refresh(gameId)}
         ></TicTacToe>
       } else {
         return <GeneralGame
           gameData={gameDataAndMoves.gameData}
           movesInfo={gameDataAndMoves.movesInfo}
           submitMoveFn={(move) => makeMove(gameId, move)}
           refreshFn={() => refresh(gameId)}
           backFn={goBack}
         ></GeneralGame>
       }
    } else {
      return <p>Loading your game...</p>;
    }
   
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
        <section className={styles["state-container"]}>
          {/* {renderStateDetails(messages, "messages")} */}
          {renderGame({ gameData: currentGame, movesInfo: currentMoves })}
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
