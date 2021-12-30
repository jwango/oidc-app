import { useContext, useEffect, useState } from "react";
import { AppConfigContext } from "./AppConfigProvider";
import { handleFetchResponse } from '../utils';

export default function useGameInterface(mPubNub, gameId) {

  const { gatewayUrl } = useContext(AppConfigContext);
  const [loaded, setLoaded] = useState(false);
  const [channels, setChannels] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [currentGame, setCurrentGame] = useState({});
  const [currentMoves, setCurrentMoves] = useState({ pendingMove: null, moves: [] });
  const [lastRes, setLastRes] = useState({});

  useEffect(() => {
    const newChannels = Array.from(channels.values());
    if (newChannels.length > 0) {
      mPubNub.addListener({ message: handleMessage });
      mPubNub.subscribe({ channels: newChannels });
    }

    return function cleanup() {
      mPubNub.unsubscribeAll();
    }
  }, [mPubNub, channels]);

  useEffect(() => { 
    getGameData(gameId);
    getMoves(gameId);
    setChannels((new Set(channels)).add(gameId));
  }, [gameId])

  function handleMessage(event) {
    const message = event.message;
    setMessages([...messages, event]);
    if (message.type == MESSAGE_TYPES.MOVE_MADE) {
      getGameData(gameId);
      getMoves(gameId);
    }
  }

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
    setLastRes(err);
  }

  return { loaded, gameData: currentGame, movesInfo: currentMoves, makeMove, refresh };
}