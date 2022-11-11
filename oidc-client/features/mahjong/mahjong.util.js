export function getTileFileName(tile) {
  if (!tile) {
      return "HIDDEN.jpg"
  } else if (tile.startsWith("FLOWER")) {
      return "FLOWER.jpg"
  } else {
      return tile + ".jpg"
  }
}

export function getTileSrc(tile, basePath = TILE_IMAGE_PATH) {
  return `${basePath}/${getTileFileName(tile)}`;
}

export const TILE_IMAGE_PATH = "/assets/mahjong/tiles";