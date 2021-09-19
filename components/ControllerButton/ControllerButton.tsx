import clsx from "clsx";
import React, {
  MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import style from "./ControllerButton.module.scss";

type Props = {
  src: string;
  balloonText?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  enabled?: boolean;
  right?: boolean;
};

const ControllerButton: React.FC<Props> = ({
  onClick,
  onMouseEnter,
  onMouseLeave,
  src,
  balloonText,
  enabled = true,
  right = false,
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
      if (!enabled) return;

      playRipple();
      if (onClick) onClick(attr);
    },
    [onClick, enabled]
  );

  return (
    <div
      className={clsx([
        enabled && style.container,
        !enabled && style.disabled,
        isRipplePlaying && style.ripplePlaying,
      ])}
      onClick={onComponentClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {balloonText && (
        <div
          className={clsx(
            style.balloon,
            right ? style.balloonRight : style.balloonTop
          )}
        >
          {balloonText}
        </div>
      )}
      <img src={src} />
    </div>
  );
};
export default ControllerButton;
