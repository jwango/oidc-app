import { usePubNub } from "pubnub-react";
import { useRouter } from "next/router";
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useGameInterface from "../../helpers/useGameInterface";
import withLayout from "../../components/with-layout";
import TicTacToe from "../../components/tictactoe.component";

function TicTacToePage() {
  const router = useRouter();
  const mPubNub = usePubNub();
  const { t } = useTranslation('common');
  const { gameId } = router.query;
  const { loaded, gameData, movesInfo, makeMove, refresh } = useGameInterface(mPubNub, gameId);

  return <main className='content-wrapper'>
    {loaded 
      ? <TicTacToe
          gameData={gameData}
          movesInfo={movesInfo}
          submitMoveFn={(move) => makeMove(gameId, move)}
          refreshFn={() => refresh(gameId)}></TicTacToe>
      : <p>{t('loadingYourGame')}</p>}
    </main>
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    }
  };
}

export default withLayout(TicTacToePage);