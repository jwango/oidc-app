import { Fragment, useEffect, createRef, useState } from "react"
import { useTranslation } from "react-i18next";

import styles from './Mahjong.module.css';
import MahjongRules from "./mahjong-rules.component";
import MahjongGrouping, { GROUPING_TYPES } from "./mahjong-grouping.component";
import { getTileSrc } from "./mahjong.util";
import sharedStyles from '../../styles/Shared.module.css';


export default function Mahjong({ gameData, movesInfo, submitMoveFn, refreshFn }) {

    const { t } = useTranslation('mahjong');
    const tCommon = useTranslation('common').t;

    const playerId = gameData?.playerData?.id
    const directions = ["N", "E", "S", "W"]

    const [selectedHandTile, setSelectedHandTile] = useState(null)
    const [playerIdShown, setPlayerIdShown] = useState(playerId)
    const [rulesVisible, setRulesVisible] = useState(false);
    const moveContainerRef = createRef();

    function renderHand(tiles) {
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

    function renderGrouping(tiles, key, styling = GROUPING_TYPES.GROUPING) {
      return <MahjongGrouping
        tiles={tiles}
        key={key}
        groupingType={styling}
      ></MahjongGrouping>;
    }

    function renderMoves(movesInfo, gameData) {
        const gameIsOver = !!(gameData?.data?.winner) || !(gameData?.data?.playersToMove?.length)
        const pendingMove = movesInfo?.pendingMove?.moveInfo
        const moves = movesInfo?.moves || []
        const playMoves = moves.filter(move => move.gameType == "MAHJONG" && move.moveInfo.moveType == "PLAY")
        const actions = moves
            .filter(move => move.gameType == "MAHJONG" && move.moveInfo.moveType != "PLAY")
            .map(move => {
                const tGrouping = move.moveInfo.groupWith.map(tile => `[${t(`tiles.${tile}`)}]`);
                const moveText = (move.moveInfo.moveType == "EAT") ? `${t('moveTypes.EAT')} ${t('moveTypes.WITH', { grouping: tGrouping })}` : t(`moveTypes.${move.moveInfo.moveType}`);
                return <button
                    className={styles["moves__action"]}
                    key={moveText}
                    onClick={() => { setSelectedHandTile(null); submitMoveFn(move)}}
                    disabled={!!pendingMove}>
                        {moveText}
                </button>
            })
        const selectedMove = playMoves.find(playMove => !!selectedHandTile && playMove.moveInfo.tile == selectedHandTile.tile)
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
            actions.push(<p key="pendingMove">{t('prompts.pendingMove', { moveType: movesInfo.pendingMove.moveInfo.moveType, tile: movesInof.pendingMove.moveInfo.tile })}</p>)
        }
        const content = gameIsOver ? <p key="gameOver">{t('gameOver')}</p> : actions
        return (<section>
            <h3>{tCommon('moves')}</h3>
            {renderCompass(gameData)}
            <span className={styles["moves__actions-container"]}>{content}</span>
        </section>)
    }

    function renderPlayerData(playerData, myselfId) {
        const silentGroupingsData = []
        const isMyself = playerData?.id === myselfId
        if (!isMyself) {
            for (let i = 0; i < playerData?.silentGongCount || 0; i += 1) {
                silentGroupingsData.push([null, null, null, null])
            }
        }
        const playersGroupingsData = playerData?.groupings || []
        const groupings = [...playersGroupingsData, ...silentGroupingsData].map((grouping, i) => renderGrouping(grouping.tiles, i))
        const handRendering = isMyself ? renderHand(playerData?.hand || []) : renderGrouping(playerData?.hand || [], playerData?.id, "player__hand")
        return (<section>
            { handRendering }
            <br></br>
            { groupings }
            { renderGrouping(playerData?.flowers || [], "flowers") }
        </section>)
    }

    function renderPlayerOptions(gameData) {
        const otherPlayersData = (gameData?.data?.otherPlayersData || []).map((p, i) => ({ direction: directionOf(p.id, gameData), id: p.id, name: p.name || `Other ${i + 1}` }))
        const myId = gameData?.playerData?.id 
        const data = [ { direction: directionOf(myId, gameData), id: myId, name: t('myself') }, ...otherPlayersData ].filter((id) => !!id)
        const options = data.map(data => {
            return <option key={data.id} value={data.id}>({data.direction}) {data.name}</option>
        })
        return <select
            id="activePlayer"
            name="activePlayer"
            onChange={(event) => setPlayerIdShown(event.target.value)}
            value={playerIdShown}
        >
            {options}
        </select>
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

    function directionOf(playerId, gameData) {
        const index = (gameData?.data?.playerSeating || {})[playerId]
        if (index == null) {
            return null
        }
        return directions[index]
    }

    function renderCompass(gameData) {
        const currentPlayer = gameData?.data?.currentPlayerId
        const direction = directionOf(currentPlayer, gameData)
        if (direction == null) { return null }
        const imagePath = `/assets/mahjong/COMPASS_${direction}.png`
        return <img src={imagePath} alt={direction + "highlighted"} width="100"></img>
    }

    const tilesOut = gameData?.data?.tilesOut || []
    const lastMove = gameData?.data?.lastMove
    const otherPlayersData = gameData?.data?.otherPlayersData || []

    const playerRendering = (!playerIdShown || playerIdShown === playerId) ? (<Fragment>
        {renderPlayerData(gameData?.playerData, playerId)}
        {renderMoves(movesInfo, gameData)}
    </Fragment>) : (<Fragment>
        {renderPlayerData(otherPlayersData.find((otherData) => otherData.id === playerIdShown), playerId)}
    </Fragment>)


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
    }, [movesInfo, gameData])

    function renderGame() {
      return (<article>
        <h1>{t('mahjong')}</h1>
        <section className={sharedStyles["controls-container"]}>
          <button type="button" onClick={() => setRulesVisible(true)}>{t('showRules')}</button>
          <button onClick={refreshFn}>{tCommon('refresh')}</button>
        </section>
        <div className={sharedStyles["layout__container"]}>
          <section className={sharedStyles["layout__column"] + " " + sharedStyles["layout__column--wide"]}>
            <section>
              <h3>{t('tilesOut', { count: gameData?.data?.deckSize })}</h3>
              { renderGrouping(tilesOut, "tilesOut") }
            </section>
            <section>
              <h3>
                <label>{t('lookAt')} </label>
                {renderPlayerOptions(gameData)}
              </h3>
              {playerRendering}
            </section>
          </section>
          <section className={sharedStyles["layout__column"] + " " + sharedStyles["layout__column--skinny"]}>
            <h3>{t('moveHistory')}</h3>
            {renderLastMoves(gameData)}
          </section>
        </div>          
      </article>)
    }

    return rulesVisible ? <MahjongRules backFn={() => setRulesVisible(false)}></MahjongRules> : renderGame();
}