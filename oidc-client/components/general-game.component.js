import sharedStyles from '../styles/Shared.module.css'
import { renderJson } from '../utils'

export default function GeneralGame({ gameData, movesInfo, submitMoveFn, refreshFn }) {
    function renderMoves(moves) {
        if (!moves) { return null; }
        const moveElements = moves.map((move, index) => <li key={index}>
          {renderMove(move)}
          <button onClick={() => submitMoveFn(move)}>Make this move</button>
        </li>)
        return <ul>{moveElements}</ul>
    }
    
    function renderMove(move) {
        return renderJson(move);
    }

    return (<section className={sharedStyles["layout__container"]}>
      <section className={sharedStyles["layout__column"]}>
        <h1>{gameData.type}</h1>
        {renderJson(gameData)}
        {renderMoves(movesInfo.moves)}
        <section className={sharedStyles["controls-container"]}>
          <button onClick={refreshFn}>Refresh</button>
        </section>
      </section>
    </section>)
}