import { usePubNub } from "pubnub-react";
import { useRouter } from "next/router";
import useGameInterface from "../../helpers/useGameInterface";
import Mahjong from "../../features/mahjong/mahjong.component";

function MahjongPage() {
  const router = useRouter();
  const mPubNub = usePubNub();
  const { gameId } = router.query;
  const { loaded, gameData, movesInfo, makeMove, refresh } = useGameInterface(mPubNub, gameId);

  return <main className="content-wrapper">
    {loaded 
      ? <Mahjong
          gameData={gameData}
          movesInfo={movesInfo}
          submitMoveFn={(move) => makeMove(gameId, move)}
          refreshFn={() => refresh(gameId)}></Mahjong>
      : <p>Loading your game...</p>}
  </main>;
}

export default MahjongPage;