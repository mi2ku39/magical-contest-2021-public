import clsx from "clsx";
import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  CSSProperties,
  useEffect,
} from "react";
import DummyImage from "~/components/DummyImage";
import KeyHint from "~/components/KeyHint";
import Icon from "~/constants/Icon";
import Illustration from "~/constants/Illustration";
import { Hints, Inputs, SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneC.module.scss";

const SceneC: React.FC<SceneProps> = ({
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
  const Directions = {
    none: 0,
    right: 1,
    left: 2,
    up: 3,
    down: 4,
  };
  type Direction = typeof Directions[keyof typeof Directions];

  const LocalScenes = {
    A: 1,
    B: 2,
    C: 3,
  };
  type LocalScene = typeof LocalScenes[keyof typeof LocalScenes];

  const scene = useMemo<LocalScene>(() => {
    if (part.barLength > 4 && part.endBar.index - 1 === bar.index) {
      return LocalScenes.B;
    }

    return LocalScenes.A;
  }, [part, bar]);

  const [keys, setKeys] = useState<{
    arrowRight: boolean;
    arrowLeft: boolean;
    arrowUp: boolean;
    arrowDown: boolean;
  }>({ arrowRight: false, arrowLeft: false, arrowUp: false, arrowDown: false });

  const animationPlayState = useMemo<string>(
    () => (isPlaying ? "running" : "paused"),
    [isPlaying]
  );

  const containerDom = useRef<HTMLDivElement>();

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

  const mainMoveHorizontalDirection = useMemo<Direction>(() => {
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
  }, [keys, isPlaying]);

  const mainMoveVerticalDirection = useMemo<Direction>(() => {
    if (
      (keys.arrowUp && keys.arrowDown) ||
      (!keys.arrowUp && !keys.arrowDown) ||
      !isPlaying
    ) {
      return Directions.none;
    }

    if (keys.arrowUp && !keys.arrowDown) {
      return Directions.up;
    }

    if (keys.arrowDown && !keys.arrowUp) {
      return Directions.down;
    }
  }, [keys, isPlaying]);

  const [mainBeforeMovedTime, setMainBeforeMovedTime] = useState<number>(null);
  const [mainMovedHeight, setMainMovedDistance] = useState<number>(0);

  useMemo(() => {
    if (mainMoveVerticalDirection === Directions.none) return;

    let diff = 0;
    if (mainBeforeMovedTime === null) {
      diff = 0;
    } else {
      diff = position - mainBeforeMovedTime;
    }
    const movingTime = (diff / beat.duration) * 50;
    if (mainMoveVerticalDirection === Directions.down) {
      setMainMovedDistance((prev) => prev + movingTime);
    }

    if (mainMoveVerticalDirection === Directions.up) {
      setMainMovedDistance((prev) => prev - movingTime);
    }

    setMainBeforeMovedTime(position);
  }, [position]);

  const [mainBeforeDeg, setMainBeforeDeg] = useState<number>(null);
  const [mainBeforeDirection, setMainBeforeDirection] =
    useState<Direction>(null);

  useMemo(() => {
    if (
      mainBeforeDirection === Directions.left &&
      (mainMoveHorizontalDirection === Directions.left ||
        mainMoveVerticalDirection !== Directions.none) &&
      scene === LocalScenes.A
    ) {
      if (addNoteCount) {
        addNoteCount();
        popupWalkNote();
      }
    }
  }, [beat]);

  const mainStyle = useMemo<CSSProperties>(() => {
    if (!beat || !position) return {};

    if (
      mainMoveHorizontalDirection === Directions.none &&
      mainMoveVerticalDirection === Directions.none
    ) {
      const isRight = mainBeforeDirection === Directions.right;
      return {
        transform: `rotateY(${isRight ? "180deg" : "0deg"}) rotateZ(${
          mainBeforeDeg ?? 0
        })`,
        marginLeft: !isRight ? "6rem" : "-6rem",
      };
    }

    const progress = (position - bar.startTime) / (bar.endTime - bar.startTime);
    const deg = (bar.index % 2 === 0 ? 1 : -1) * (10 * progress - 5);
    setMainBeforeDeg(deg);

    let isLeft = false;
    if (mainMoveHorizontalDirection === Directions.left) {
      isLeft = true;
      setMainBeforeDirection(Directions.left);
    } else if (mainMoveHorizontalDirection === Directions.right) {
      isLeft = false;
      setMainBeforeDirection(Directions.right);
    } else {
      isLeft = mainBeforeDirection === Directions.left;
    }

    return {
      transform: `rotateY(${isLeft ? "0deg" : "180deg"}) rotateZ(${deg}deg)`,
      marginLeft: isLeft ? "6rem" : "-6rem",
    };
  }, [
    position,
    beat,
    mainBeforeDeg,
    mainBeforeDirection,
    mainMoveHorizontalDirection,
  ]);

  const musicNoteStyle = useMemo<CSSProperties>(() => {
    return { transform: `translateY(${mainMovedHeight}px)` };
  }, [mainMovedHeight]);

  /**
   * 緑の子関係
   */

  const [visibleGree, setVisibleGreen] = useState<boolean>(false);
  const [greenDelay, setGreenDelay] = useState<number>(null);
  const [greenDuration, setGreenDuration] = useState<number>(null);

  const greenStyle = useMemo<CSSProperties>(() => {
    return !greenDelay || !greenDuration
      ? {}
      : {
          animationDelay: `${greenDelay}ms`,
          animationDuration: `${greenDuration}ms`,
          animationPlayState,
        };
  }, [greenDelay, greenDuration, animationPlayState]);

  /**
   * keyevent関係
   */

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === Inputs.arrowRight) {
        if (isPlaying) pushShowedHint(Hints.arrowHint);
        setKeys((prev) => {
          return { ...prev, arrowRight: true };
        });
      }

      if (e.code === Inputs.arrowLeft) {
        if (isPlaying) pushShowedHint(Hints.arrowHint);
        setKeys((prev) => {
          return { ...prev, arrowLeft: true };
        });
      }

      if (e.code === Inputs.arrowUp) {
        setKeys((prev) => {
          return { ...prev, arrowUp: true };
        });
      }

      if (e.code === Inputs.arrowDown) {
        setKeys((prev) => {
          return { ...prev, arrowDown: true };
        });
      }
    },
    [isPlaying, popupWalkNote]
  );
  const onKeyup = useCallback((e: KeyboardEvent) => {
    if (e.code === Inputs.arrowRight) {
      setKeys((prev) => {
        return { ...prev, arrowRight: false };
      });
      setMainBeforeMovedTime(null);
    }

    if (e.code === Inputs.arrowLeft) {
      setKeys((prev) => {
        return { ...prev, arrowLeft: false };
      });
      setMainBeforeMovedTime(null);
    }

    if (e.code === Inputs.arrowUp) {
      setKeys((prev) => {
        return { ...prev, arrowUp: false };
      });
      setMainBeforeMovedTime(null);
    }

    if (e.code === Inputs.arrowDown) {
      setKeys((prev) => {
        return { ...prev, arrowDown: false };
      });
      setMainBeforeMovedTime(null);
    }
  }, []);

  useEffect(() => {
    if (
      part &&
      part.barLength > 4 &&
      (greenDuration === null || greenDelay === null)
    ) {
      setVisibleGreen(true);

      if (part.endBar.previous?.previous) {
        setGreenDelay(
          part.endBar.previous.previous.startTime - part.startBar.startTime
        );
        setGreenDuration(
          part.endBar.previous.previous.duration + part.endBar.previous.duration
        );
      } else {
        setGreenDelay(part.endBar.startTime - part.startBar.startTime);
        setGreenDuration(part.endBar.duration);
      }
    }
  }, [part]);

  useEffect(() => {
    if (window) {
      window.addEventListener("keydown", onKeydown, false);
      window.addEventListener("keyup", onKeyup, false);
    }
    return () => {
      if (window) {
        window.removeEventListener("keydown", onKeydown);
        window.removeEventListener("keyup", onKeyup);
      }
    };
  }, [onKeydown, onKeyup]);

  return (
    <div className={sceneStyle.container} ref={containerDom}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      {scene === LocalScenes.A && (
        <>
          <div className={styles.characterContainer}>
            <div
              className={styles.mainCharacter}
              ref={mainContainer}
              style={musicNoteStyle}
            >
              <img src={Illustration.main.fly} style={mainStyle} />
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
          </div>
        </>
      )}
      {visibleGree && (
        <div className={styles.greenContainer}>
          <div style={greenStyle}>
            <img src={Illustration.character.cho.walk} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneC;
