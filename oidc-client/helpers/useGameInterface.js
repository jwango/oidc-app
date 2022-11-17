import { useContext, useEffect, useState } from "react";
import { AppConfigContext } from "./AppConfigProvider";
import { handleFetchResponse } from '../utils';
import { MESSAGE_TYPES } from "../components/game-interface.component";
import { useSnackbar } from '../helpers/SnackbarContext';

export default function useGameInterface(mPubNub, gameId) {

  const [showSnackbar, dismissSnackbar] = useSnackbar();
  const { gatewayUrl } = useContext(AppConfigContext);
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentGame, setCurrentGame] = useState({});
  const [currentMoves, setCurrentMoves] = useState({ pendingMove: null, moves: [] });
  const [lastRes, setLastRes] = useState({});

  useEffect(() => {
    getGameData(gameId);
    getMoves(gameId);
  }, [gameId]);

  useEffect(() => {
    mPubNub.unsubscribeAll();
    mPubNub.subscribe({ channels: [gameId] });
    mPubNub.addListener({ message: handleMessage });

    return function cleanup() {
      mPubNub.unsubscribeAll();
    }
  }, [mPubNub, gameId])

  function handleMessage(event) {
    const message = event.message;
    setMessages((oldMessages) => [...oldMessages, event]);
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
    let errorMsg = 'The server cannot process that request.'
    if (err.status != 404 && err.status >= 400 && err.status < 500) {
      errorMsg = 'That action is unsupported.';
    } else if (err.status >= 500) {
      errorMsg = 'The server failed to process that request.';
    }
    showSnackbar(errorMsg);
    dismissSnackbar(5000);
    setLastRes(err);
  }

  return { loaded, gameData: currentGame, movesInfo: currentMoves, messages, makeMove, refresh };
}