import { usePubNub } from "pubnub-react";
import { useRouter } from "next/router";
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useGameInterface from "../../helpers/useGameInterface";
import Mahjong from "../../features/mahjong/mahjong.component";
import withLayout from "../../components/with-layout";

function MahjongPage() {
  const router = useRouter();
  const mPubNub = usePubNub();
  const { t } = useTranslation('common');
  const { gameId } = router.query;
  const { loaded, gameData, movesInfo, makeMove, refresh } = useGameInterface(mPubNub, gameId);

  return <main className="content-wrapper">
    {loaded 
      ? <Mahjong
          gameData={gameData}
          movesInfo={movesInfo}
          submitMoveFn={(move) => makeMove(gameId, move)}
          refreshFn={() => refresh(gameId)}></Mahjong>
      : <p>{t('loadingYourGame')}</p>}
  </main>;
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'mahjong']))
    }
  };
}

export default withLayout(MahjongPage);