export function hasArrowHitTarget(arrow, target) {
  if (!arrow || !target) {
    return false;
  }

  const arrowBox = {
    left: arrow.x - arrow.width / 2,
    right: arrow.x + arrow.width / 2,
    top: arrow.y - arrow.height / 2,
    bottom: arrow.y + arrow.height / 2
  };
  const targetBox = {
    left: target.x - target.width / 2,
    right: target.x + target.width / 2,
    top: target.y - target.height / 2,
    bottom: target.y + target.height / 2
  };

  return (
    arrowBox.left < targetBox.right &&
    arrowBox.right > targetBox.left &&
    arrowBox.top < targetBox.bottom &&
    arrowBox.bottom > targetBox.top
  );
}
