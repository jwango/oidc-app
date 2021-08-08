import sharedStyles from '../styles/Shared.module.css'
import { renderJson } from '../utils'

export default function GeneralGame({ gameData, movesInfo, submitMoveFn, refreshFn, backFn }) {
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

    return (<section className={sharedStyles["layout__container--center"]}>
      <section className={sharedStyles["layout__column"]}>
        <h2>{gameData.type}</h2>
        {renderJson(gameData)}
        {renderMoves(movesInfo.moves)}
        <section className={sharedStyles["controls-container"]}>
          <button onClick={refreshFn}>Refresh</button>
          <button onClick={backFn}>Back to Lobby</button>
        </section>
      </section>
    </section>)
}