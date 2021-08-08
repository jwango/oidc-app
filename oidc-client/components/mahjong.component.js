import styles from '../styles/Mahjong.module.css'  
import { Fragment, useEffect, createRef, useState } from "react"

export default function Mahjong({ gameData, movesInfo, submitMoveFn }) {
    const tileWidth = 40
    const tileHeight = 60
    const tileImagePath = "assets/mahjong/tiles"
    const playerId = gameData?.playerData?.id
    const directions = ["N", "E", "S", "W"]

    const [selectedHandTile, setSelectedHandTile] = useState(null)
    const [playerIdShown, setPlayerIdShown] = useState(playerId)
    const moveContainerRef = createRef();

    function getTileFileName(tile) {
        if (!tile) {
            return "HIDDEN.png"
        } else if (tile.startsWith("FLOWER")) {
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

    function renderGrouping(tiles, key, styling = "grouping") {
        const tileElements = tiles.map((tile, index) => {
            return <li key={tile + index} className={styles["player__tile"]}>
                <img src={tileImagePath + "/" + getTileFileName(tile)} alt={tile} width={tileWidth} height={tileHeight}></img>
            </li>
        })
        return <ul className={styles[styling]} key={key}>{ tileElements }</ul>
    }

    function renderMoves(movesInfo, gameData) {
        const gameIsOver = !!(gameData?.data?.winner) || !(gameData?.data?.playersToMove?.length)
        const pendingMove = movesInfo?.pendingMove?.moveInfo
        const moves = movesInfo?.moves || []
        const playMoves = moves.filter(move => move.gameType == "MAHJONG" && move.moveInfo.moveType == "PLAY")
        const actions = moves
            .filter(move => move.gameType == "MAHJONG" && move.moveInfo.moveType != "PLAY")
            .map(move => {
                const moveText = (move.moveInfo.moveType == "EAT") ? `EAT with ${move.moveInfo.groupWith}` : move.moveInfo.moveType;
                return <button
                    key={moveText}
                    onClick={() => { setSelectedHandTile(null); submitMoveFn(move)}}
                    disabled={!!pendingMove}>
                        {moveText}
                </button>
            })
        const selectedMove = playMoves.find(playMove => !!selectedHandTile && playMove.moveInfo.tile == selectedHandTile.tile)
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
        } else if (playMoves.length > 0) {
            if (selectedHandTile != null) {
                setSelectedHandTile(null)
            }
            actions.push(<p key="prompt">You may select a tile to play</p>)
        }
        if (moves.length === 0) {
            actions.push(<p key="nomoves">Currently no moves for you to make</p>)
        }
        if (pendingMove != null) {
            actions.push(<p key="pendingMove">System is still processing your last move request: {movesInfo.pendingMove.moveInfo.moveType} {movesInfo.pendingMove.moveInfo.tile}</p>)
        }
        const content = gameIsOver ? <p key="gameOver">Game is over</p> : actions
        const movePrompt = !!(moves.length) ? <p key="playPrompt">Make a move:</p> : null
        return (<section><h3>Moves</h3>{renderCompass(gameData)}<span className={styles["moves__actions"]}>{movePrompt}{content}</span></section>)
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
        const data = [ { direction: directionOf(myId, gameData), id: myId, name: "Myself" }, ...otherPlayersData ].filter((id) => !!id)
        const options = data.map(data => {
            return <option key={data.id} value={data.id} selected={playerIdShown === data.id}>({data.direction}) {data.name}</option>
        })
        return <select id="activePlayer" name="activePlayer" onChange={(event) => setPlayerIdShown(event.target.value)}>{options}</select>
    }

    function renderLastMoves(gameData) {
        const myId = gameData?.playerData?.id 
        const nameMap = (gameData?.data?.otherPlayersData || []).reduce((acc, curr, i) => {
            return { ...acc, [curr.id]: curr.name || `Other ${i + 1}` }
        }, { [myId]: "You" })

        const moves = (gameData?.data?.moves || []).map(move => {
            const withText = !!(move.groupWith?.length) ? `with ${move.groupWith}` : "";
            return <li><strong>({directionOf(move.playerId, gameData)}) {nameMap[move.playerId] || "???"}:</strong> {move.moveType} {move.tile || ""} {withText}</li>
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
        const imagePath = `assets/mahjong/COMPASS_${direction}.png`
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
   
    return (<section className={styles["mahjong__container"]}>
        <section className={styles["mahjong__column"]}>
            <section>
                <h3>Tiles Out ({ gameData?.data?.deckSize} left)</h3>
                { renderGrouping(tilesOut, "tilesOut") }
            </section>
            <section>
                <h3>
                    <label>Look at </label>
                    {renderPlayerOptions(gameData)}
                </h3>
                {playerRendering}
            </section>
        </section>
        <section className={styles["mahjong__column"]}>
            <h3>Move History</h3>
            {renderLastMoves(gameData)}
        </section>
    </section>)
}