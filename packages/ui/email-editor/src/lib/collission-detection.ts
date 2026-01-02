import { closestCorners, pointerWithin } from "@dnd-kit/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function collisionDetection(args: any) {
  return pointerWithin(args) || closestCorners(args);
}
