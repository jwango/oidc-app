export function getTileFileName(tile) {
  if (!tile) {
      return "HIDDEN.png"
  } else if (tile.startsWith("FLOWER")) {
      return "FLOWER.png"
  } else {
      return tile + ".png"
  }
}

export function getTileSrc(tile, basePath = TILE_IMAGE_PATH) {
  return `${basePath}/${getTileFileName(tile)}`;
}

export const TILE_IMAGE_PATH = "/assets/mahjong/tiles";