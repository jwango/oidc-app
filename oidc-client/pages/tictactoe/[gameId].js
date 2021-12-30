import { usePubNub } from "pubnub-react";
import { useRouter } from "next/router";
import useGameInterface from "../../helpers/useGameInterface";
import TicTacToe from "../../components/tictactoe.component";

function TicTacToePage() {
  const router = useRouter();
  const mPubNub = usePubNub();
  const { gameId } = router.query;
  const { loaded, gameData, movesInfo, makeMove, refresh } = useGameInterface(mPubNub, gameId);

  return <main className='content-wrapper'>
    {loaded 
      ? <TicTacToe
          gameData={gameData}
          movesInfo={movesInfo}
          submitMoveFn={(move) => makeMove(gameId, move)}
          refreshFn={() => refresh(gameId)}></TicTacToe>
      : <p>Loading your game...</p>}
    </main>
  }

export default TicTacToePage;