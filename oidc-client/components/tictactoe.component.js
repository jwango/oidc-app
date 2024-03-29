import { useTranslation } from 'next-i18next';
import sharedStyles from '../styles/Shared.module.css';
import styles from '../styles/TicTacToe.module.css';

export default function TicTacToe({ gameData, movesInfo, submitMoveFn, refreshFn }) {
    const { t } = useTranslation('common');

    const ROW_TO_LETTER = {
        0: "A",
        1: "B",
        2: "C"
    };

    function renderMoves(moves) {
        if (!moves) { return null; }
        const moveElements = moves.map((move, index) => <li key={index}>
          {renderMove(move)}
          <button onClick={() => submitMoveFn(move)}>{t('makeThisMove')}</button>
        </li>)
        return <ul>{moveElements}</ul>
    }
    
    function renderMove(move) {
        return (
            <span style={ { "marginRight": "16px" } }>[{ROW_TO_LETTER[move.moveInfo.row]}, {move.moveInfo.column}]</span>
        );
    }

    function renderPlayers(gameData) {
        if (!gameData?.data?.players) { return null; }
        const players = gameData.data.players;
        const playerEls = players.map(p => <p className={styles["player__data"]} key={p.id}>{p.symbol}: {p.name}</p>);
        return <section className={styles["player__data-container"]}>{playerEls}</section>
    }

    function renderTicTacToeGameData(gameData) {
        if (!gameData?.data) { return null }
        const board = gameData.data.board;
        const winner = gameData.data.winner;
        const players = gameData.data.players;
        const boardStr = " |0|1|2|\n--------\n" + board.map((row, i) => ROW_TO_LETTER[i] + "|" + row.map(cell => cell || " ").join("|") + "|").join("\n-------\n");
        const winnerEl = winner ? <label>{t('winnerIs')} {players.find(p => p.id === winner)?.name}</label> : null;
        
        return (
          <div>
              <pre>{boardStr}</pre>
              {winnerEl}
          </div>
        );
      }

    return (<section className={sharedStyles["layout__container"]}>
        <section className={sharedStyles["layout__column"] + " " + sharedStyles["layout__column--wide"]}>
            <h1>{t('gameTypes.TIC_TAC_TOE')}</h1>
            {renderTicTacToeGameData(gameData)}
            {renderPlayers(gameData)}
            <section className={sharedStyles["controls-container"]}><button onClick={refreshFn}>{t('refresh')}</button></section>
        </section>
        <section className={sharedStyles["layout__column"] + " " + sharedStyles["layout__column--skinny"]}>
            {renderMoves(movesInfo.moves)}
        </section>
    </section>)
}