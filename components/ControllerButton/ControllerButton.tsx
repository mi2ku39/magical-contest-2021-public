import clsx from "clsx";
import React, { MouseEventHandler, useCallback, useState } from "react";
import style from "./ControllerButton.module.scss";

type Props = {
  src: string;
  balloonText?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
};

const ControllerButton: React.FC<Props> = ({
  onClick,
  onMouseEnter,
  onMouseLeave,
  src,
  balloonText,
}: Props) => {
  const [isRipplePlaying, setRipplePlayingState] = useState(false);
  const playRipple = useCallback(() => {
    setRipplePlayingState(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setRipplePlayingState(false);
        resolve(null);
      }, 500);
    });
  }, [isRipplePlaying, setRipplePlayingState]);
  const onComponentClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (attr) => {
      playRipple();
      if (onClick) onClick(attr);
    },
    [onClick]
  );

  return (
    <div
      className={clsx([
        style.container,
        isRipplePlaying && style.ripplePlaying,
      ])}
      onClick={onComponentClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {balloonText && <div className={style.balloon}>{balloonText}</div>}
      <img src={src} />
    </div>
  );
};
export default ControllerButton;
