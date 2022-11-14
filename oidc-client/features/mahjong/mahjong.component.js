import { useEffect, createRef, useState } from "react"
import { useTranslation } from "react-i18next";

import styles from './Mahjong.module.css';
import MahjongRules from "./mahjong-rules.component";
import MahjongGrouping, { GROUPING_TYPES } from "./mahjong-grouping.component";
import { getTileSrc } from "./mahjong.util";
import sharedStyles from '../../styles/Shared.module.css';

const directions = ["N", "E", "S", "W"];

export default function Mahjong({ gameData, movesInfo, submitMoveFn, refreshFn }) {

    const { t } = useTranslation('mahjong');
    const tCommon = useTranslation('common').t;

    const playerId = gameData?.playerData?.id

    const [selectedHandTile, setSelectedHandTile] = useState(null);
    const [rulesVisible, setRulesVisible] = useState(false);
    const moveContainerRef = createRef();
    const tilesOutContainerRef = createRef();

    function getMoveText(moveInfo) {
      if (moveInfo.moveType == "EAT") {
        const tGrouping = moveInfo.groupWith.map(tile => `[${t(`tiles.${tile}`)}]`);
        return `${t('moveTypes.EAT')} ${t('moveTypes.WITH', { grouping: tGrouping })}`;
      } else if (moveInfo.moveType == "GONG_SILENT") {
        return `${t('moveTypes.GONG_SILENT')} [${t(`tiles.${moveInfo.tile}`)}]`;
      }

      return t(`moveTypes.${moveInfo.moveType}`);
    }

    function renderMoves(movesInfo, gameData) {
        const gameIsOver = !!(gameData?.data?.winner) || !(gameData?.data?.playersToMove?.length);
        const pendingMove = movesInfo?.pendingMove?.moveInfo;
        const moves = movesInfo?.moves || [];
        const playMoves = moves.filter(move => move.gameType == "MAHJONG" && move.moveInfo.moveType == "PLAY");
        const actions = moves
            .filter(move => move.gameType == "MAHJONG" && move.moveInfo.moveType != "PLAY")
            .map(move => {
                const moveText = getMoveText(move.moveInfo);
                return <button
                    className={styles["moves__action"]}
                    key={moveText}
                    onClick={() => { setSelectedHandTile(null); submitMoveFn(move)}}
                    disabled={!!pendingMove}>
                        {moveText}
                </button>
            });
        const selectedMove = playMoves.find(playMove => !!selectedHandTile && playMove.moveInfo.tile == selectedHandTile.tile);
        if (!!selectedMove) {
            actions.push(<button
                className={styles["moves__action"]}
                key={"Play"+selectedHandTile.tile}
                onClick={() => {
                    setSelectedHandTile(null)
                    submitMoveFn(selectedMove)
                }}
            >
                {t('moveTypes.PLAY')} [{t(`tiles.${selectedHandTile.tile}`)}]
            </button>)
        } else if (playMoves.length > 0) {
            if (selectedHandTile != null) {
                setSelectedHandTile(null);
            }
            actions.push(<p key="prompt">{t('prompts.selectTile')}</p>)
        }
        if (moves.length === 0) {
            actions.push(<p key="nomoves">{t('prompts.noMoves')}</p>)
        }
        if (pendingMove != null) {
            actions.push(<p key="pendingMove">{t('prompts.pendingMove', { moveType: movesInfo.pendingMove.moveInfo.moveType, tile: movesInfo.pendingMove.moveInfo.tile })}</p>)
        }
        const content = gameIsOver ? <p key="gameOver">{t('gameOver')}</p> : actions
        return (<>
            <h3>{tCommon('moves')}</h3>
            {renderCompass(gameData)}
            <span className={styles["moves__actions-container"]}>{content}</span>
        </>)
    }

    function renderLastMoves(gameData) {
        const myId = gameData?.playerData?.id 
        const nameMap = (gameData?.data?.otherPlayersData || []).reduce((acc, curr, i) => {
            return { ...acc, [curr.id]: curr.name || `Other ${i + 1}` }
        }, { [myId]: "You" })

        const moves = (gameData?.data?.moves || []).map((move, i) => {
            const tGrouping = move.groupWith.map(tile => `[${t(`tiles.${tile}`)}]`);
            const withText = !!(move.groupWith?.length) ? t('moveTypes.WITH', { grouping: tGrouping }) : "";
            return <li key={`lastMove${i}`}><strong>({directionOf(move.playerId, gameData)}) {nameMap[move.playerId] || "???"}:</strong> {t(`moveTypes.${move.moveType}`)} {move.tile ? `[${t(`tiles.${move.tile}`)}]` : ""} {withText}</li>
        })
        return <ul className={styles["moves__container"]} ref={moveContainerRef}>{moves}</ul>
    }

    function renderCompass(gameData) {
        const currentPlayer = gameData?.data?.currentPlayerId
        const direction = directionOf(currentPlayer, gameData)
        if (direction == null) { return null }
        const imagePath = `/assets/mahjong/COMPASS_${direction}.png`
        return <img src={imagePath} alt={direction + "highlighted"} width="100"></img>
    }

    const tilesOut = gameData?.data?.tilesOut || [];
    const lastMove = gameData?.data?.lastMove;
    const otherPlayersData = gameData?.data?.otherPlayersData || [];

    useEffect(() => {
        if (playerId != null && lastMove != null && lastMove.playerId == playerId && selectedHandTile == null) {
            if (lastMove.moveType == "DRAW" || lastMove.moveType == "DRAW_TAIL") {
                const index = gameData.playerData.hand.findIndex(tile => tile == lastMove.tile)
                setSelectedHandTile({ tile: lastMove.tile, index })
            }
        }
        if (!!moveContainerRef.current) {
            moveContainerRef.current.scrollTop = moveContainerRef.current.scrollHeight;
        }
        if (!!tilesOutContainerRef.current) {
          tilesOutContainerRef.current.scrollTop = tilesOutContainerRef.current.scrollHeight;
        }
    }, [movesInfo, gameData])

    function renderGame() {
      return (<article>
        <h1 className={sharedStyles["layout__container"]} style={{ justifyContent: "space-between" }}>
          {t('mahjong')}
          <span className={sharedStyles['controls-container']}>
            <button type="button" onClick={() => setRulesVisible(true)}>{t('showRules')}</button>
            <button onClick={refreshFn}>{tCommon('refresh')}</button>
          </span>
        </h1>

        <div className={sharedStyles["layout__container"]}>
          <section className={sharedStyles["layout__column"]} style={{ width: "100%" }}>
            <h3>{t('tilesOut', { count: gameData?.data?.deckSize })}</h3>
            <div className={styles["tiles-out"]} ref={tilesOutContainerRef}>
              <MahjongGrouping tiles={tilesOut} />
            </div>  
            <h3 style={{marginTop: 0}}>{t('moveHistory')}</h3>
            {renderLastMoves(gameData)}
            
          </section>
          <section className={sharedStyles["layout__column"]}>
          <MahjongPlayerSection
            playerData={gameData?.playerData}
            gameData={gameData}
            selectedHandTile={selectedHandTile}
            setSelectedHandTile={setSelectedHandTile}
          />
          {renderMoves(movesInfo, gameData)}
          </section>
         
          <MahjongPlayerSection gameData={gameData} playerData={otherPlayersData[0]} className={sharedStyles["layout__column"]} />
          <MahjongPlayerSection gameData={gameData} playerData={otherPlayersData[1]} className={sharedStyles["layout__column"]} />
          <MahjongPlayerSection gameData={gameData} playerData={otherPlayersData[2]} className={sharedStyles["layout__column"]} />
        </div>          
      </article>)
    }

    return rulesVisible ? <MahjongRules backFn={() => setRulesVisible(false)}></MahjongRules> : renderGame();
}

function MahjongPlayerSection({ className, playerData, gameData, selectedHandTile, setSelectedHandTile }) {
  const { t } = useTranslation('mahjong');

  if (playerData == null) { return null; }

  const silentGroupingsData = []
  const isMyself = !!setSelectedHandTile;
  if (!isMyself) {
      for (let i = 0; i < playerData?.silentGongCount || 0; i += 1) {
          silentGroupingsData.push([null, null, null, null])
      }
  }
  const playersGroupingsData = playerData?.groupings || []
  const groupings = [...playersGroupingsData, ...silentGroupingsData].map((grouping, i) => {
    return <MahjongGrouping tiles={grouping?.tiles} key={i} />;
  });
  const handRendering = isMyself ? (
    <MahjongPlayerHand tiles={playerData?.hand || []} selectedHandTile={selectedHandTile} setSelectedHandTile={setSelectedHandTile} />
  ) : (
    <MahjongGrouping tiles={playerData?.hand || []} groupingType={GROUPING_TYPES.HAND} />
  );

  const direction = directionOf(playerData.id, gameData);

  return <section className={className || ''}>
    <h3>{(direction && `(${direction}) ` || '') + (isMyself ? t('myself') : playerData.name)}</h3>
    { handRendering }
    <br></br>
    { groupings }
    <MahjongGrouping tiles={playerData?.flowers || []} groupingType={GROUPING_TYPES.GROUPING} />
  </section>
}

function MahjongPlayerHand({ tiles, selectedHandTile, setSelectedHandTile }) {
  const handTiles = tiles.map((tile, index) => {
    const isSelected = selectedHandTile?.tile == tile && selectedHandTile?.index == index
    const stateCss = isSelected ? "hand__tile-image--selected" : "hand__tile-image--unselected";
    return <li
      key={tile + index}
      className={styles["player__tile"]}
      >
      <input
          type="image"
          className={styles["hand__tile-image"] + " " + styles[stateCss]}
          src={getTileSrc(tile)}
          alt={tile}
          onClick={() => {
              if (isSelected) { setSelectedHandTile(null) } else { setSelectedHandTile({ tile, index }) }
          }}
      ></input>
    </li>
  })
  return <ul className={styles["player__hand"]}>{ handTiles }</ul>
}

function directionOf(playerId, gameData) {
  const index = (gameData?.data?.playerSeating || {})[playerId]
  if (index == null) {
      return null
  }
  return directions[index]
}