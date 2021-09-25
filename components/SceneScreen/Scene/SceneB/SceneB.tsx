import clsx from "clsx";
import {
  createElement,
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DummyImage from "~/components/DummyImage";
import KeyHint from "~/components/KeyHint";
import Icon from "~/constants/Icon";
import Illustration from "~/constants/Illustration";
import QuantizedBar from "~/models/Beats/QuantizedBar";
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
  addNoteCount,
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

  const LocalParts = {
    A: 1,
    B: 2,
  };
  type LocalPart = typeof LocalParts[keyof typeof LocalParts];
  const scene = useMemo<LocalPart>(() => {
    if (part.endBar.index - 1 === bar.index) {
      return LocalParts.B;
    }
    return LocalParts.A;
  }, [part, bar]);

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

  const mainContainer = useRef<HTMLDivElement>();
  const popupWalkNote = useCallback(() => {
    if (!document) return;

    const dom = document.createElement("div");
    dom.className = styles.soundNote;
    dom.setAttribute("style", `animation-duration: ${beat.duration}ms`);
    const img = document.createElement("img");
    img.src = Icon.musicNoteWH;
    dom.appendChild(img);

    mainContainer?.current?.appendChild(dom);

    new Promise<void>((resolve) => {
      setTimeout(() => {
        mainContainer?.current?.removeChild(dom);
        resolve();
      }, beat.duration + 100);
    });
  }, [mainContainer, beat]);

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
    if (mainMoveDirection === Directions.none && scene === LocalParts.A) return;

    let diff = 0;
    if (mainBeforeMovedTime === null) {
      diff = 0;
    } else {
      diff = position - mainBeforeMovedTime;
    }
    const movingTime = (diff / beat.duration) * 50;
    if (mainMoveDirection === Directions.left || scene === LocalParts.B) {
      setMainMovedDistance(mainMovedDistance + movingTime);
    }

    if (mainMoveDirection === Directions.right) {
      setMainMovedDistance(mainMovedDistance - movingTime);
    }

    setMainBeforeMovedTime(position);
  }, [position]);

  useMemo(() => {
    if (mainMoveDirection === Directions.left && scene === LocalParts.A) {
      if (addNoteCount) {
        addNoteCount();
        popupWalkNote();
      }
    }
  }, [beat]);

  const mainIllust = useMemo(
    () =>
      scene === LocalParts.A
        ? !beat || !isMoving || beat.position % 2 === 1
          ? Illustration.main.walkAlt
          : Illustration.main.walk
        : Illustration.main.fly,
    [beat, isMoving, scene]
  );

  const [mainBeforeDeg, setMainBeforeDeg] = useState<number>(null);

  const [mainBeforeDirection, setMainBeforeDirection] =
    useState<Direction>(null);

  const mainStyle = useMemo<CSSProperties>(() => {
    if (!beat || !position) return {};

    if (scene === LocalParts.B) {
      return {
        transform: `rotateY(0deg) rotateZ(0deg)`,
        marginLeft: "6rem",
      };
    }

    if (mainMoveDirection === Directions.none) {
      const isRight = mainBeforeDirection === Directions.right;
      return {
        transform: `rotateY(${isRight ? "180deg" : "0deg"}) rotateZ(${
          mainBeforeDeg ?? 0
        })`,
        marginLeft: !isRight ? "6rem" : "-6rem",
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
      marginLeft: isLeft ? "6rem" : "-6rem",
    };
  }, [position, beat, mainBeforeDeg, mainBeforeDirection, mainMoveDirection]);

  /**
   * 挨拶できるキャラクター関係
   */

  const [encountablePosition, setEncountablePosition] = useState<number>(null);
  const [encountableHiddenTime, setEncountableHiddenTime] =
    useState<number>(null);
  const [encountableHiddenDuration, setEncountableHiddenDuration] =
    useState<number>(null);

  const encountableStyle = useMemo<CSSProperties>(() => {
    return !encountableHiddenTime || !encountableHiddenDuration
      ? {
          transform: `translateX(${
            -1 * encountablePosition + mainMovedDistance
          }px)`,
        }
      : {
          transform: `translateX(${
            -1 * encountablePosition + mainMovedDistance
          }px)`,
          animationDelay: `${encountableHiddenTime}ms`,
          animationDuration: `${encountableHiddenDuration}ms`,
        };
  }, [
    encountablePosition,
    mainMovedDistance,
    encountableHiddenTime,
    encountableHiddenDuration,
  ]);

  /**
   * keyevent関係
   */

  const onKeydown = useCallback(
    ({ code }: KeyboardEvent) => {
      if (code === Inputs.arrowRight) {
        if (isPlaying) pushShowedHint(Hints.arrowHint);
        setKeys((prev) => {
          return { ...prev, arrowRight: true };
        });
      }

      if (code === Inputs.arrowLeft) {
        if (isPlaying) pushShowedHint(Hints.arrowHint);
        setKeys((prev) => {
          return { ...prev, arrowLeft: true };
        });
      }
    },
    [isPlaying, popupWalkNote]
  );
  const onKeyup = useCallback(({ code }: KeyboardEvent) => {
    if (code === Inputs.arrowRight) {
      setKeys((prev) => {
        return { ...prev, arrowRight: false };
      });
      setMainBeforeMovedTime(null);
    }

    if (code === Inputs.arrowLeft) {
      setKeys((prev) => {
        return { ...prev, arrowLeft: false };
      });
      setMainBeforeMovedTime(null);
    }
  }, []);

  useEffect(() => {
    if (part && encountablePosition === null) {
      let bars: QuantizedBar[] = [];
      if (part.barLength >= 8) {
        bars = part.bars.slice(0, part.barLength - 4);
      } else {
        bars = part.bars.slice(0, Math.floor(part.barLength / 2));
      }
      const count = bars.reduce((total, it) => it.beats.length + total, 0);
      setEncountablePosition(count * 50);
    }

    if (part && encountableHiddenTime === null) {
      setEncountableHiddenTime(
        part.endBar.previous.startTime - part.startBar.startTime
      );
      setEncountableHiddenDuration(part.endBar.previous.firstBeat.duration);
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
        <div className={styles.mainCharacter} ref={mainContainer}>
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
      <div className={styles.encountableContainer} style={encountableStyle}>
        <DummyImage width="5rem" height="10rem" />
      </div>
    </div>
  );
};

export default SceneB;
