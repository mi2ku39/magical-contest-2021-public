import clsx from "clsx";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import KeyHint from "~/components/KeyHint";
import Illustration from "~/constants/Illustration";
import { Hints, SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneB.module.scss";

const SceneB: React.FC<SceneProps> = ({
  position,
  beat,
  bar,
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

  const mainCharacterMoveDirection = useMemo<Direction>(() => {
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
    () => mainCharacterMoveDirection !== Directions.none,
    [mainCharacterMoveDirection]
  );

  const mainCharacterIllust = useMemo(
    () =>
      !beat || !isMoving || beat.position % 2 === 1
        ? Illustration.main.walkAlt
        : Illustration.main.walk,
    [beat, isMoving]
  );

  const [mainCharacterBeforeDeg, setMainCharacterBeforeDeg] =
    useState<number>(null);

  const [mainCharacterBeforeDirection, setMainCharacterBeforeDirection] =
    useState<Direction>(null);

  const mainCharacterStyle = useMemo<CSSProperties>(() => {
    if (!beat || !position) return {};

    if (mainCharacterMoveDirection === Directions.none) {
      const isRight = mainCharacterBeforeDirection === Directions.right;
      return {
        transform: `rotateY(${isRight ? "180deg" : "0deg"}) rotateZ(${
          mainCharacterBeforeDeg ?? 0
        })`,
        marginLeft: !isRight ? "10rem" : undefined,
      };
    }

    const progress =
      (position - beat.startTime) / (beat.endTime - beat.startTime);
    const deg = (beat.position % 2 === 0 ? 1 : -1) * (10 * progress - 5);
    setMainCharacterBeforeDeg(deg);

    const isLeft = mainCharacterMoveDirection === Directions.left;

    setMainCharacterBeforeDirection(
      isLeft ? Directions.left : Directions.right
    );

    return {
      transform: `rotateY(${isLeft ? "0deg" : "180deg"}) rotateZ(${deg}deg)`,
      marginLeft: isLeft ? "10rem" : undefined,
    };
  }, [
    position,
    beat,
    mainCharacterBeforeDeg,
    mainCharacterBeforeDirection,
    mainCharacterMoveDirection,
  ]);

  const onKeydown = useCallback(
    ({ code }: KeyboardEvent) => {
      if (code === Inputs.arrowRight) {
        pushShowedHint(Hints.arrowHint);
        setKeys({ ...keys, arrowRight: true });
      }

      if (code === Inputs.arrowLeft) {
        pushShowedHint(Hints.arrowHint);
        setKeys({ ...keys, arrowLeft: true });
      }
    },
    [keys]
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
  }, [onKeydown, onKeyup]);

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.characterContainer}>
        <div className={styles.mainCharacter}>
          <img src={mainCharacterIllust} style={mainCharacterStyle} />
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
    </div>
  );
};

export default SceneB;
