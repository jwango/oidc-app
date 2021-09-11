import MahjongGrouping, { GROUPING_TYPES } from "./mahjong-grouping.component";

import styles from './Mahjong.module.css';
import sharedStyles from "../../styles/Shared.module.css";


export default function MahjongRules({ backFn }) {
  const CIRCLE_TILES = ["CIRCLE_1", "CIRCLE_2", "CIRCLE_3", "CIRCLE_4", "CIRCLE_5", "CIRCLE_6", "CIRCLE_7", "CIRCLE_8", "CIRCLE_9"];
  const STICK_TILES = ["STICK_1", "STICK_2", "STICK_3", "STICK_4", "STICK_5", "STICK_6", "STICK_7", "STICK_8", "STICK_9"];
  const CHARACTER_TILES = ["NUMBER_1", "NUMBER_2", "NUMBER_3", "NUMBER_4", "NUMBER_5", "NUMBER_6", "NUMBER_7", "NUMBER_8", "NUMBER_9"];
  const WIND_TILES = ["EAST", "SOUTH", "WEST", "NORTH"];
  const DRAGON_TILES = ["ZONG", "FA", "BOARD"];
  const FLOWER_TILES = ["FLOWER_A1", "FLOWER_B1"];

  const WINNING_HAND_GROUPINGS = [["NUMBER_1", "NUMBER_1"], ["NUMBER_1", "NUMBER_2", "NUMBER_3"], ["STICK_1", "STICK_1", "STICK_1"]];

  return <article className={styles["rules"]}>
    <h1>Mahjong Rules</h1>
    <button type="button" onClick={() => backFn()}>Back to game</button>
    <div className={sharedStyles["layout__container"]}>
      <div className={sharedStyles["layout__column"]}>
        <section>
          <h2>Tiles</h2>
          <p>The deck first consists of the following suited tiles:</p>
          <dl>
            <dt>Circles</dt>
            <dd><MahjongGrouping tiles={CIRCLE_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/></dd>
            <dt>Sticks</dt>
            <dd><MahjongGrouping tiles={STICK_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/></dd>
            <dt>Numbers</dt>
            <dd><MahjongGrouping tiles={CHARACTER_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/></dd>
          </dl>
          
          <p>Additionally there exists Honor Tiles (<em>Winds</em>, <em>Dragons</em>) and Bonus Tiles (<em>Flowers</em>) with no numerical sequence:</p>
          <dl>
            <dt>Winds</dt>
            <dd>
              <MahjongGrouping tiles={WIND_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <p>Each is a cardinal direction for East, South, West, North respectively.</p>
            </dd>
            <dt>Dragons</dt>
            <dd>
              <MahjongGrouping tiles={DRAGON_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <p>Referred to as the Red, Green, and Blue Dragons respectively. Also known as <em>zong</em>, <em>fa</em>, and <em>bai ban</em>.</p>
            </dd>
            <dt>Flowers</dt>
            <dd><MahjongGrouping tiles={FLOWER_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/></dd>
          </dl>
          
          <p>Of each of these types of tiles (suited, honor, bonus), there exists 4 of the same (such as four East winds for example).</p>
        </section>
        <section>
          <h2>Drawing</h2>
          <ul>
            <li>On your turn, you may choose to draw a tile from the "top" of the deck.</li>
            <li>If you draw a flower tile at any point then you will draw from the "bottom" of the deck.</li>
            <li>If you meld a <em>GONG</em> then you will also draw a tile from the "bottom" of the deck.</li>
          </ul>
        </section>
        <section>
          <h2>Win Condition</h2>
          <p>A player wins whenever they can take a tile that is played or drawn to form a <em>winning hand</em>.</p>
          <dt>Winning Hand</dt>
          <dd>A winning hand consists of only one pair of the same tile (also known as eyes), and the rest melds (see Melds section).</dd>

          <figure>
            <MahjongGrouping tiles={WINNING_HAND_GROUPINGS.flat()} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
            <figcaption><strong>Figure 1.</strong> Winning hand lined up, after 3 revealed melds (not shown here)</figcaption>
          </figure>
          <figure>
            {WINNING_HAND_GROUPINGS.map(g =><MahjongGrouping tiles={g} groupingType={GROUPING_TYPES.GROUPING_FIG}/>)}
            <figcaption><strong>Figure 2.</strong> Winning hand with the hand melds isolated</figcaption>
          </figure>
        </section>
      </div>
      <div className={sharedStyles["layout__column"]}>
        <section>
          <h2>Melds</h2>
          <p>Bonus tiles are excluded from Melds.</p>
          <p>A <dfn>meld</dfn> is the action of forming an <em>exposed</em> or <em>concealed</em> grouping of tiles after a tile is played or drawn. All <dfn>melds</dfn> are <em>exposed</em> unless it is a <em>SILENT GONG</em>.</p>
          <dl>
            <dt>Chow</dt>
            <dd>
              <p>You may only <dfn>CHOW</dfn> on your turn to complete a sequential meld of 3 tiles of the same suit.</p>
              <MahjongGrouping tiles={["CIRCLE_4", "CIRCLE_5", "CIRCLE_6"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <MahjongGrouping tiles={["STICK_1", "STICK_2", "STICK_3"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <MahjongGrouping tiles={["NUMBER_7", "NUMBER_8", "NUMBER_9"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
            </dd>

            <dt>Pong</dt>
            <dd>
              <p>You may <dfn>PONG</dfn> whenever a tile is played, regardless of your turn, so long as it completes a three-of-a-kind meld of the same exact tile (suit and if applicable, sequence).</p>
              <p>After you <dfn>PONG</dfn> you must select a tile from your hand to play.</p>
              <MahjongGrouping tiles={["ZONG", "ZONG", "ZONG"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <MahjongGrouping tiles={["STICK_1", "STICK_1", "STICK_1"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <MahjongGrouping tiles={["EAST", "EAST", "EAST"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
            </dd>

            <dt>Gong</dt>
            <dd>
              <p>You may <dfn>GONG</dfn> whenever a tile is played, regardless of your turn, so long as it completes a four-of-a-kind meld of the same exact tile (suit and if applicable, sequence).</p>
              <p>After you <dfn>GONG</dfn> you must draw a tile from the "bottom" of the deck, and then play a tile from your hand.</p>
              <figure>
                <MahjongGrouping tiles={["BOARD", "BOARD", "BOARD", "BOARD"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <MahjongGrouping tiles={["NUMBER_4", "NUMBER_4", "NUMBER_4", "NUMBER_4"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <figcaption><strong>Figure 3.</strong> Dragon <em>GONG</em> (left) Number 4 <em>GONG</em> (right)</figcaption>
              </figure>
            </dd>

            <dt>Silent Gong</dt>
            <dd>
              <p>You may <dfn>SILENT GONG</dfn> on your turn only if you have a four-of-a-kind grouping in your hand. When you perform this action, you reveal a concealed <em>GONG</em> meld where other players do not know what tiles make up the grouping.</p>
              <figure>
                <MahjongGrouping tiles={[null, null, null, null]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <figcaption><strong>Figure 4.</strong> Concealed <em>GONG</em></figcaption>
              </figure>
              <p>After you <dfn>SILENT GONG</dfn> you must draw a tile from "bottom" of the deck, and then play a tile from your hand.</p>
            </dd>
            
            <dt>Self gong</dt>
            <dd>
              <p>You may <dfn>SELF GONG</dfn> on your turn only if you have an exposed <em>PONG</em> meld. When you perform this action your exposed <em>PONG</em> becomes an exposed <em>GONG</em>.</p>
              <p>After you <dfn>SELF GONG</dfn> you must draw a tile from "bottom" of the deck, and then play a tile from your hand.</p>
              <figure>
                <MahjongGrouping tiles={["CIRCLE_3", "CIRCLE_3", "CIRCLE_3"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <figcaption><strong>Figure 5.</strong> Exposed <em>PONG</em></figcaption>
              </figure>
              <figure>
                <MahjongGrouping tiles={["CIRCLE_3", "CIRCLE_3", "CIRCLE_3", "CIRCLE_3"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <figcaption><strong>Figure 6.</strong> Now an exposed <em>GONG</em> after <em>SELF GONG</em></figcaption>
              </figure>
            </dd>
          </dl>
          <h3>Priority</h3>
          <ol>
            <li>Any tile played that allows a player to complete their hand and win takes priorirty. If multiple players win using the same tile, the winner is determined via the order of play starting from the player who gave the winning tile.</li>
            <li>A <em>PONG</em> or a <em>GONG</em> meld has priority over and interrupts a <em>CHOW</em> or <em>DRAW</em> action. The turn is then given to the player who performed this interrupting action.</li>
            <li><em>CHOW</em> and <em>DRAW</em> actions have the least priority.</li>
          </ol>
        </section>
      </div>
    </div>
  </article>
}