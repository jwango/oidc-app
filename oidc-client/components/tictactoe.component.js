import sharedStyles from '../styles/Shared.module.css'

export default function TicTacToe({ gameData, movesInfo, submitMoveFn, refreshFn }) {
    const ROW_TO_LETTER = {
        0: "A",
        1: "B",
        2: "C"
    };

    function renderMoves(moves) {
        if (!moves) { return null; }
        const moveElements = moves.map((move, index) => <li key={index}>
          {renderMove(move)}
          <button onClick={() => submitMoveFn(move)}>Make this move</button>
        </li>)
        return <ul>{moveElements}</ul>
    }
    
    function renderMove(move) {
        return (
            <span style={ { "marginRight": "16px" } }>[{ROW_TO_LETTER[move.moveInfo.row]}, {move.moveInfo.column}]</span>
        );
    }

    function renderTicTacToeGameData(gameData) {
        if (!gameData?.data) { return null }
        const board = gameData.data.board;
        const winner = gameData.data.winner || "none";
        const boardStr = " |0|1|2|\n--------\n" + board.map((row, i) => ROW_TO_LETTER[i] + "|" + row.map(cell => cell || " ").join("|") + "|").join("\n-------\n");
        return (
          <div>
              <pre>{boardStr}</pre>
              <label>winner? {winner}</label>
          </div>
        );
      }

    return (<section className={sharedStyles["layout__container"]}>
        <section className={sharedStyles["layout__column"]}>
            <h2>{gameData.type}</h2>
            {renderTicTacToeGameData(gameData)}
            {renderMoves(movesInfo.moves)}
            <section className={sharedStyles["controls-container"]}>
            <button onClick={refreshFn}>Refresh</button>
            </section>
        </section>
    </section>)
}