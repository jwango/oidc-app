import { useTranslation } from "react-i18next";
import MahjongGrouping, { GROUPING_TYPES } from "./mahjong-grouping.component";

import styles from './Mahjong.module.css';
import sharedStyles from "../../styles/Shared.module.css";


export default function MahjongRules({ backFn }) {
  const { t } = useTranslation('mahjong');

  const CIRCLE_TILES = ["CIRCLE_1", "CIRCLE_2", "CIRCLE_3", "CIRCLE_4", "CIRCLE_5", "CIRCLE_6", "CIRCLE_7", "CIRCLE_8", "CIRCLE_9"];
  const STICK_TILES = ["STICK_1", "STICK_2", "STICK_3", "STICK_4", "STICK_5", "STICK_6", "STICK_7", "STICK_8", "STICK_9"];
  const CHARACTER_TILES = ["NUMBER_1", "NUMBER_2", "NUMBER_3", "NUMBER_4", "NUMBER_5", "NUMBER_6", "NUMBER_7", "NUMBER_8", "NUMBER_9"];
  const WIND_TILES = ["EAST", "SOUTH", "WEST", "NORTH"];
  const DRAGON_TILES = ["ZONG", "FA", "BOARD"];
  const FLOWER_TILES = ["FLOWER_A1", "FLOWER_B1"];

  const WINNING_HAND_GROUPINGS = [["NUMBER_1", "NUMBER_1"], ["NUMBER_1", "NUMBER_2", "NUMBER_3"], ["STICK_1", "STICK_1", "STICK_1"]];

  return <article className={styles["rules"]}>
    <h1 className={sharedStyles["layout__container"]} style={{ justifyContent: "space-between" }}>
      {t('rules.mahjongRules')}
      <span className={sharedStyles["controls-container"]}><button type="button" onClick={() => backFn()}>{t('rules.backToGame')}</button></span>
    </h1>
    <div className={sharedStyles["layout__container"]}>
      <div className={sharedStyles["layout__column"]}>
        <section>
          <h2>{t('rules.tiles')}</h2>
          <p>{t('rules.deckFirstConsistsOf')}:</p>
          <dl>
            <dt>{t('rules.circles')}</dt>
            <dd><MahjongGrouping tiles={CIRCLE_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/></dd>
            <dt>{t('rules.sticks')}</dt>
            <dd><MahjongGrouping tiles={STICK_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/></dd>
            <dt>{t('rules.numbers')}</dt>
            <dd><MahjongGrouping tiles={CHARACTER_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/></dd>
          </dl>
          
          <p>{t('rules.additionallyHonorTiles')} (<em>{t('rules.winds')}</em>, <em>{t('rules.dragons')}</em>) {t('rules.andBonusTiles')} (<em>{t('rules.flowers')}</em>) {t('rules.withNoSequence')}:</p>
          <dl>
            <dt>{t('rules.winds')}</dt>
            <dd>
              <MahjongGrouping tiles={WIND_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <p>{t('rules.eachWindIsCardinal')}</p>
            </dd>
            <dt>{t('rules.dragons')}</dt>
            <dd>
              <MahjongGrouping tiles={DRAGON_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <p>{t('rules.dragonTilesReferredToAs')}</p>
            </dd>
            <dt>{t('rules.flowers')}</dt>
            <dd><MahjongGrouping tiles={FLOWER_TILES} groupingType={GROUPING_TYPES.GROUPING_FIG}/></dd>
          </dl>
          
          <p>{t('rules.fourOfEachKind')}</p>
        </section>
        <section>
          <h2>{t('rules.drawing')}</h2>
          <ul>
            <li>{t('rules.drawing1DrawFromTop')}</li>
            <li>{t('rules.drawing2FlowerDrawFromBottom')}</li>
            <li>{t('rules.drawing3MeldGongDrawFromBottom')}</li>
          </ul>
        </section>
        <section>
          <h2>{t('rules.winCondition')}</h2>
          <p>{t('rules.playersWinsWithWinningHand')}</p>
          <dt>{t('rules.winningHand')}</dt>
          <dd>{t('rules.winningHandDefinition')}</dd>

          <figure>
            <MahjongGrouping tiles={WINNING_HAND_GROUPINGS.flat()} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
            <figcaption><strong>Figure 1.</strong> {t('rules.captionWinningHandAfter3Melds')}</figcaption>
          </figure>
          <figure>
            {WINNING_HAND_GROUPINGS.map(g =><MahjongGrouping tiles={g} groupingType={GROUPING_TYPES.GROUPING_FIG}/>)}
            <figcaption><strong>Figure 2.</strong> {t('rules.captionWinningHandMeldsSeparated')}</figcaption>
          </figure>
        </section>
      </div>
      <div className={sharedStyles["layout__column"]}>
        <section>
          <h2>{t('rules.melds')}</h2>
          <p>{t('rules.bonusTilesExcludedFromMelds')}</p>
          <p>{t('rules.meldDefinition')}</p>
          <dl>
            <dt>{t('rules.chow')}</dt>
            <dd>
              <p>{t('rules.youMay')} <dfn>{t('rules.chow')}</dfn> {t('rules.chowCondition')}</p>
              <MahjongGrouping tiles={["CIRCLE_4", "CIRCLE_5", "CIRCLE_6"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <MahjongGrouping tiles={["STICK_1", "STICK_2", "STICK_3"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <MahjongGrouping tiles={["NUMBER_7", "NUMBER_8", "NUMBER_9"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
            </dd>

            <dt>{t('rules.pong')}</dt>
            <dd>
              <p>{t('rules.youMay')} <dfn>{t('rules.pong')}</dfn> {t('rules.pongCondition')}</p>
              <p>{t('rules.afterYou')} <dfn>{t('rules.pong')}</dfn> {t('rules.pongAfter')}</p>
              <MahjongGrouping tiles={["ZONG", "ZONG", "ZONG"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <MahjongGrouping tiles={["STICK_1", "STICK_1", "STICK_1"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
              <MahjongGrouping tiles={["EAST", "EAST", "EAST"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
            </dd>

            <dt>{t('rules.gong')}</dt>
            <dd>
              <p>{t('rules.youMay')} <dfn>{t('rules.gong')}</dfn> {t('rules.gongCondition')}</p>
              <p>{t('rules.afterYou')} <dfn>{t('rules.gong')}</dfn> {t('rules.gongAfter')}</p>
              <figure>
                <MahjongGrouping tiles={["BOARD", "BOARD", "BOARD", "BOARD"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <MahjongGrouping tiles={["NUMBER_4", "NUMBER_4", "NUMBER_4", "NUMBER_4"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <figcaption><strong>Figure 3.</strong> {t('rules.captionDragonGongNumber4Gong')}</figcaption>
              </figure>
            </dd>

            <dt>{t('rules.silentGong')}</dt>
            <dd>
              <p>{t('rules.youMay')} <dfn>{t('rules.silentGong')}</dfn> {t('rules.silentGongCondition')}</p>
              <figure>
                <MahjongGrouping tiles={[null, null, null, null]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <figcaption><strong>Figure 4.</strong> {t('rules.captionConcealedGong')}</figcaption>
              </figure>
              <p>{t('rules.afterYou')} <dfn>{t('rules.silentGong')}</dfn> {t('rules.gongAfter')}</p>
            </dd>
            
            <dt>{t('rules.selfGong')}</dt>
            <dd>
              <p>{t('rules.youMay')} <dfn>{t('rules.selfGong')}</dfn> {t('rules.selfGongCondition')}</p>
              <p>{t('rules.afterYou')} <dfn>{t('rules.selfGong')}</dfn> {t('rules.gongAfter')}</p>
              <figure>
                <MahjongGrouping tiles={["CIRCLE_3", "CIRCLE_3", "CIRCLE_3"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <figcaption><strong>Figure 5.</strong> {t('rules.captionExposedPong')}</figcaption>
              </figure>
              <figure>
                <MahjongGrouping tiles={["CIRCLE_3", "CIRCLE_3", "CIRCLE_3", "CIRCLE_3"]} groupingType={GROUPING_TYPES.GROUPING_FIG}/>
                <figcaption><strong>Figure 6.</strong> {t('rules.captionExposedGongAfterConcealedGong')}</figcaption>
              </figure>
            </dd>
          </dl>
          <h3>{t('rules.priority')}</h3>
          <ol>
            <li>{t('rules.priority1Win')}</li>
            <li>{t('rules.priority2PongGong')}</li>
            <li>{t('rules.priority3ChowDraw')}</li>
          </ol>
        </section>
      </div>
    </div>
  </article>
}