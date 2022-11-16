import styles from './Mahjong.module.css';
import { getTileSrc } from "./mahjong.util";

export const GROUPING_TYPES = {
  HAND: 'player__hand',
  GROUPING: 'grouping',
  GROUPING_FIG: 'grouping__figure'
};

export default function MahjongGrouping({ tiles, groupingType = GROUPING_TYPES.GROUPING }) {
  if (tiles == null || tiles.length === 0) { return null; }
  const tileElements = tiles.map((tile, index) => {
    return <li key={tile + index} className={styles["player__tile"]}>
        <img src={getTileSrc(tile)} alt={tile || "HIDDEN"}></img>
    </li>
  });
  return <ul className={styles[groupingType]}>{ tileElements }</ul>
}