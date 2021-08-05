import styles from '../styles/Mahjong.module.css'  
import { useEffect, useRef, useState } from "react"

export default function Mahjong({ gameData, movesInfo, submitMoveFn }) {
    const tileWidth = 40
    const tileHeight = 60
    const tileImagePath = "assets/mahjong/tiles"

    const [selectedHandTile, setSelectedHandTile] = useState(null)

    function getTileFileName(tile) {
        if (tile.startsWith("FLOWER")) {
            return "FLOWER.png"
        } else {
            return tile + ".png"
        }
    }

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
                    src={tileImagePath + "/" + getTileFileName(tile)}
                    alt={tile}
                    width={tileWidth}
                    height={tileHeight}
                    onClick={() => {
                        if (isSelected) { setSelectedHandTile(null) } else { setSelectedHandTile({ tile, index }) }
                    }}
                ></input>
            </li>
        })
        return <ul className={styles["player__hand"]}>{ handTiles }</ul>
    }

    function renderGrouping(tiles, key) {
        const tileElements = tiles.map((tile, index) => {
            return <li key={tile + index} className={styles["player__tile"]}>
                <img src={tileImagePath + "/" + getTileFileName(tile)} alt={tile} width={tileWidth} height={tileHeight}></img>
            </li>
        })
        return <ul className={styles["grouping"]} key={key}>{ tileElements }</ul>
    }

    function renderMoves(movesInfo) {
        const pendingMove = movesInfo?.pendingMove?.moveInfo
        const moves = movesInfo?.moves || []
        const playMoves = moves.filter(move => move.gameType == "MAHJONG" && move.moveInfo.moveType == "PLAY")
        const actions = moves
            .filter(move => move.gameType == "MAHJONG" && move.moveInfo.moveType != "PLAY")
            .map(move => {
                const moveText = (move.moveInfo.moveType == "EAT") ? `EAT with ${move.moveInfo.groupWith}` : move.moveInfo.moveType;
                return <button key={moveText} onClick={() => submitMoveFn(move)} disabled={!!pendingMove}>{moveText}</button>
            })
        if (selectedHandTile != null) {
            const selectedMove = playMoves.find(playMove => playMove.moveInfo.tile == selectedHandTile.tile)
            if (!!selectedMove) {
                actions.push(<button
                    key={"Play"+selectedHandTile.tile}
                    onClick={() => {
                        setSelectedHandTile(null)
                        submitMoveFn(selectedMove)
                    }}
                >
                    Play {selectedHandTile.tile}
                </button>)
            }
        } else if (playMoves.length > 0) {
            actions.push(<p key="prompt">Or select a tile to play</p>)
        }
        if (pendingMove != null) {
            actions.push(<p key="pendingMove">System is still processing your last move request: {movesInfo.pendingMove.moveInfo.moveType} {movesInfo.pendingMove.moveInfo.tile}</p>)
        }
        return (<section><h3>Moves</h3>{actions}</section>)
    }

    const groupings = (gameData?.playerData?.groupings || []).map((grouping, i) => renderGrouping(grouping.tiles, i))
    const tilesOut = gameData?.data?.tilesOut || []
    const tilesOut1 = [...tilesOut]
    const lastTile = tilesOut1.pop()
    const tilesOut2 = (!!lastTile)  ? [lastTile] : []
    const playerId = gameData?.playerData?.id
    const lastMove = gameData?.data?.lastMove

    useEffect(() => {
        if (playerId != null && lastMove != null && lastMove.playerId == playerId && selectedHandTile == null) {
            if (lastMove.moveType == "DRAW" || lastMove.moveType == "DRAW_TAIL") {
                const index = gameData.playerData.hand.findIndex(tile => tile == lastMove.tile)
                setSelectedHandTile({ tile: lastMove.tile, index })
            }
        }
    }, [movesInfo, gameData])
   
    return (<div>
        <section>
            <h3>Tiles Out ({ gameData?.data?.deckSize} left)</h3>
            { renderGrouping(tilesOut1, "tiles1") }
            { renderGrouping(tilesOut2, "tiles2") }
        </section>
        <section>
            <h3>Hand</h3>
            { renderHand(gameData?.playerData?.hand || []) }
        </section>
        <section>
            <h3>Groupings</h3>
            { groupings }
        </section>
        <section>
            <h3>Flowers</h3>
            { renderGrouping(gameData?.playerData?.flowers || [], "flowers") }
        </section>
        { renderMoves(movesInfo) }
    </div>)
}