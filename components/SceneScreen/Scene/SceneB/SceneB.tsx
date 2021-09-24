import clsx from "clsx";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import DummyImage from "~/components/DummyImage";
import KeyHint from "~/components/KeyHint";
import Illustration from "~/constants/Illustration";
import { Hints, SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneB.module.scss";

const SceneB: React.FC<SceneProps> = ({
  position,
  beat,
  bar,
  part,
  phrase,
  isPlaying,
  pushShowedHint,
  isShowedArrowHint,
}) => {
  const Inputs = {
    arrowRight: "ArrowRight",
    arrowLeft: "ArrowLeft",
  };
  const Directions = {
    none: 0,
    right: 1,
    left: 2,
  };
  type Direction = typeof Directions[keyof typeof Directions];

  const [keys, setKeys] = useState<{ arrowRight: boolean; arrowLeft: boolean }>(
    { arrowRight: false, arrowLeft: false }
  );

  const animationPlayState = useMemo<string>(
    () => (isPlaying ? "running" : "paused"),
    [isPlaying]
  );

  /**
   * 主人公の動き関係
   */

  const mainMoveDirection = useMemo<Direction>(() => {
    if (
      (keys.arrowRight && keys.arrowLeft) ||
      (!keys.arrowRight && !keys.arrowLeft) ||
      !isPlaying
    ) {
      return Directions.none;
    }

    if (keys.arrowRight && !keys.arrowLeft) {
      return Directions.right;
    }

    if (keys.arrowLeft && !keys.arrowRight) {
      return Directions.left;
    }
  }, [keys, animationPlayState]);

  const isMoving = useMemo<boolean>(
    () => mainMoveDirection !== Directions.none,
    [mainMoveDirection]
  );

  const [mainBeforeMovedTime, setMainBeforeMovedTime] = useState<number>(null);
  const [mainMovedDistance, setMainMovedDistance] = useState<number>(0);

  useMemo(() => {
    if (mainMoveDirection === Directions.none) return;

    let diff = 0;
    if (mainBeforeMovedTime === null) {
      diff = 0;
    } else {
      diff = position - mainBeforeMovedTime;
    }
    const movingTime = (diff / beat.duration) * 50;
    if (mainMoveDirection === Directions.left) {
      setMainMovedDistance(mainMovedDistance + movingTime);
    }

    if (mainMoveDirection === Directions.right) {
      setMainMovedDistance(mainMovedDistance - movingTime);
    }

    setMainBeforeMovedTime(position);
  }, [position]);

  const mainIllust = useMemo(
    () =>
      !beat || !isMoving || beat.position % 2 === 1
        ? Illustration.main.walkAlt
        : Illustration.main.walk,
    [beat, isMoving]
  );

  const [mainBeforeDeg, setMainBeforeDeg] = useState<number>(null);

  const [mainBeforeDirection, setMainBeforeDirection] =
    useState<Direction>(null);

  const mainStyle = useMemo<CSSProperties>(() => {
    if (!beat || !position) return {};

    if (mainMoveDirection === Directions.none) {
      const isRight = mainBeforeDirection === Directions.right;
      return {
        transform: `rotateY(${isRight ? "180deg" : "0deg"}) rotateZ(${
          mainBeforeDeg ?? 0
        })`,
        marginLeft: !isRight ? "10rem" : undefined,
      };
    }

    const progress =
      (position - beat.startTime) / (beat.endTime - beat.startTime);
    const deg = (beat.position % 2 === 0 ? 1 : -1) * (10 * progress - 5);
    setMainBeforeDeg(deg);

    const isLeft = mainMoveDirection === Directions.left;

    setMainBeforeDirection(isLeft ? Directions.left : Directions.right);

    return {
      transform: `rotateY(${isLeft ? "0deg" : "180deg"}) rotateZ(${deg}deg)`,
      marginLeft: isLeft ? "10rem" : undefined,
    };
  }, [position, beat, mainBeforeDeg, mainBeforeDirection, mainMoveDirection]);

  /**
   * 挨拶できるキャラクター関係
   */

  const [encountablePosition, setEncountablePosition] = useState<number>(null);

  /**
   * keyevent関係
   */

  const onKeydown = useCallback(
    ({ code }: KeyboardEvent) => {
      if (code === Inputs.arrowRight) {
        if (isPlaying) pushShowedHint(Hints.arrowHint);
        setKeys({ ...keys, arrowRight: true });
      }

      if (code === Inputs.arrowLeft) {
        if (isPlaying) pushShowedHint(Hints.arrowHint);
        setKeys({ ...keys, arrowLeft: true });
      }
    },
    [keys, isPlaying]
  );
  const onKeyup = useCallback(
    ({ code }: KeyboardEvent) => {
      if (code === Inputs.arrowRight) {
        setKeys({ ...keys, arrowRight: false });
      }

      if (code === Inputs.arrowLeft) {
        setKeys({ ...keys, arrowLeft: false });
      }
    },
    [keys]
  );

  useEffect(() => {
    if (part && encountablePosition === null) {
      const bars = part.bars.slice(0, Math.floor(part.barLength / 2));
      const count = bars.reduce((total, it) => it.beats.length + total, 0);
      setEncountablePosition(count * 50);
    }
    if (document?.body) {
      document.body.addEventListener("keydown", onKeydown, false);
      document.body.addEventListener("keyup", onKeyup, false);
    }
    return () => {
      if (document?.body) {
        document.body.removeEventListener("keydown", onKeydown);
        document.body.removeEventListener("keyup", onKeyup);
      }
    };
  }, [onKeydown, onKeyup, part]);

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.characterContainer}>
        <div className={styles.mainCharacter}>
          <img src={mainIllust} style={mainStyle} />
        </div>
      </div>
      <div className={styles.hintContainer}>
        <div className={styles.hintElement}>
          <div
            className={clsx(
              styles.hint,
              isShowedArrowHint && styles.hiddenHint
            )}
          >
            <KeyHint left />
            <div>を押してみよう！</div>
          </div>
        </div>
        <div className={styles.hintElement}></div>
      </div>
      <div
        className={styles.encountableContainer}
        style={{
          transform: `translateX(${
            -1 * encountablePosition + mainMovedDistance
          }px)`,
        }}
      >
        <DummyImage width="5rem" height="10rem" />
      </div>
    </div>
  );
};

export default SceneB;
