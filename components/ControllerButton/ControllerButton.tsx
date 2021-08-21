import clsx from "clsx";
import React, { useCallback, useState } from "react";
import style from "./ControllerButton.module.scss";

type Props = {
  src: string;
  onClick?: () => void;
};

const ControllerButton: React.FC<Props> = ({ onClick, src }: Props) => {
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
  const onComponentClick = useCallback(() => {
    playRipple();
    if (onClick) onClick();
  }, [onClick]);

  return (
    <div
      className={clsx([
        style.container,
        isRipplePlaying && style.ripplePlaying,
      ])}
      onClick={onComponentClick}
    >
      <img src={src} />
    </div>
  );
};
export default ControllerButton;
