import { getPublishedWork } from "./site";
import { getPosts } from "./blog";

/**
 * Nav items safe to render: drops /work while no case study is published and
 * /blog while no post is, so header, footer and 404 never point at an empty
 * page. Publishing the first one brings every link back.
 */
export function visibleNav<T extends { to: string }>(items: readonly T[]): T[] {
  const hasWork = getPublishedWork().length > 0;
  const hasPosts = getPosts().length > 0;
  return items.filter((n) => (n.to !== "/work" || hasWork) && (n.to !== "/blog" || hasPosts));
}
