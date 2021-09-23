import clsx from "clsx";
import { useMemo } from "react";
import styles from "./KeyHint.module.scss";

type Props = {
  space?: boolean;
  up?: boolean;
  left?: boolean;
  right?: boolean;
  down?: boolean;
};

const basePath = "/images/icons";
const icons = {
  space: `${basePath}/space-bar.svg`,
  arrowUp: `${basePath}/arrow-up.svg`,
  arrowLeft: `${basePath}/arrow-left.svg`,
  arrowRight: `${basePath}/arrow-right.svg`,
  arrowDown: `${basePath}/arrow-down.svg`,
};

const KeyHint: React.FC<Props> = ({
  space = false,
  up = false,
  left = false,
  right = false,
  down = false,
}) => {
  const visible = useMemo(
    () => space || up || left || right || down,
    [space, up, left, right, down]
  );

  const icon = useMemo(
    () =>
      space
        ? icons.space
        : up
        ? icons.arrowUp
        : left
        ? icons.arrowLeft
        : right
        ? icons.arrowRight
        : icons.arrowDown,
    [space, up, left, right, down]
  );

  return visible ? (
    <div className={clsx(styles.container, space ? styles.long : styles.short)}>
      <img src={icon} />
    </div>
  ) : (
    <div></div>
  );
};
export default KeyHint;
