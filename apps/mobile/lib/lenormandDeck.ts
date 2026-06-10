export { LENORMAND_CARD_SLUGS } from "./lenormandSlugs";

/** Static requires for Metro bundling (didot-1890 deck). */
const LENORMAND_IMAGES: Record<number, number> = {
  1: require("../assets/lenormand/didot-1890/01-rider.jpg"),
  2: require("../assets/lenormand/didot-1890/02-clover.jpg"),
  3: require("../assets/lenormand/didot-1890/03-ship.jpg"),
  4: require("../assets/lenormand/didot-1890/04-house.jpg"),
  5: require("../assets/lenormand/didot-1890/05-tree.jpg"),
  6: require("../assets/lenormand/didot-1890/06-cloud.jpg"),
  7: require("../assets/lenormand/didot-1890/07-snake.jpg"),
  8: require("../assets/lenormand/didot-1890/08-coffin.jpg"),
  9: require("../assets/lenormand/didot-1890/09-bouquet.jpg"),
  10: require("../assets/lenormand/didot-1890/10-scythe.jpg"),
  11: require("../assets/lenormand/didot-1890/11-whip.jpg"),
  12: require("../assets/lenormand/didot-1890/12-birds.jpg"),
  13: require("../assets/lenormand/didot-1890/13-child.jpg"),
  14: require("../assets/lenormand/didot-1890/14-fox.jpg"),
  15: require("../assets/lenormand/didot-1890/15-bear.jpg"),
  16: require("../assets/lenormand/didot-1890/16-stars.jpg"),
  17: require("../assets/lenormand/didot-1890/17-stork.jpg"),
  18: require("../assets/lenormand/didot-1890/18-dog.jpg"),
  19: require("../assets/lenormand/didot-1890/19-tower.jpg"),
  20: require("../assets/lenormand/didot-1890/20-garden.jpg"),
  21: require("../assets/lenormand/didot-1890/21-mountain.jpg"),
  22: require("../assets/lenormand/didot-1890/22-crossroads.jpg"),
  23: require("../assets/lenormand/didot-1890/23-mice.jpg"),
  24: require("../assets/lenormand/didot-1890/24-heart.jpg"),
  25: require("../assets/lenormand/didot-1890/25-ring.jpg"),
  26: require("../assets/lenormand/didot-1890/26-book.jpg"),
  27: require("../assets/lenormand/didot-1890/27-letter.jpg"),
  28: require("../assets/lenormand/didot-1890/28-man.jpg"),
  29: require("../assets/lenormand/didot-1890/29-woman.jpg"),
  30: require("../assets/lenormand/didot-1890/30-lily.jpg"),
  31: require("../assets/lenormand/didot-1890/31-sun.jpg"),
  32: require("../assets/lenormand/didot-1890/32-moon.jpg"),
  33: require("../assets/lenormand/didot-1890/33-key.jpg"),
  34: require("../assets/lenormand/didot-1890/34-fish.jpg"),
  35: require("../assets/lenormand/didot-1890/35-anchor.jpg"),
  36: require("../assets/lenormand/didot-1890/36-cross.jpg"),
};

export function getLenormandCardImageSource(id: number): number | undefined {
  return LENORMAND_IMAGES[id];
}
