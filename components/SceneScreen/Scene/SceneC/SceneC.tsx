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
import QuantizedBar from "~/models/Beats/QuantizedBar";
import { Hints, SceneProps } from "../../SceneScreen";
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
  const Inputs = {
    arrowRight: "ArrowRight",
    arrowLeft: "ArrowLeft",
    arrowUp: "ArrowUp",
    arrowDown: "ArrowDown",
  };
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
    if (part.endBar.index - 2 === bar.index) {
      return LocalScenes.B;
    }

    if (part.endBar.index - 1 === bar.index) {
      return LocalScenes.C;
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
    if (mainMoveHorizontalDirection === Directions.none) return;

    let diff = 0;
    if (mainBeforeMovedTime === null) {
      diff = 0;
    } else {
      diff = position - mainBeforeMovedTime;
    }
    const movingTime = (diff / beat.duration) * 50;
    if (mainMoveVerticalDirection === Directions.down) {
      setMainMovedDistance(mainMovedHeight + movingTime);
    }

    if (mainMoveVerticalDirection === Directions.up) {
      setMainMovedDistance(mainMovedHeight - movingTime);
    }

    setMainBeforeMovedTime(position);
  }, [position]);

  useMemo(() => {
    if (
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

  const [mainBeforeDeg, setMainBeforeDeg] = useState<number>(null);

  const [mainBeforeDirection, setMainBeforeDirection] =
    useState<Direction>(null);

  const mainStyle = useMemo<CSSProperties>(() => {
    if (!beat || !position) return {};

    if (scene === LocalScenes.B) {
      return {
        transform: `rotateY(0deg) rotateZ(0deg)`,
        marginLeft: "6rem",
      };
    }

    if (mainMoveHorizontalDirection === Directions.none) {
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

    const isLeft = mainMoveHorizontalDirection === Directions.left;

    setMainBeforeDirection(isLeft ? Directions.left : Directions.right);

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
        e.preventDefault();
      }

      if (e.code === Inputs.arrowLeft) {
        if (isPlaying) pushShowedHint(Hints.arrowHint);
        setKeys((prev) => {
          return { ...prev, arrowLeft: true };
        });
        e.preventDefault();
      }

      if (e.code === Inputs.arrowUp) {
        setKeys((prev) => {
          return { ...prev, arrowUp: true };
        });
        e.preventDefault();
      }

      if (e.code === Inputs.arrowDown) {
        setKeys((prev) => {
          return { ...prev, arrowDown: false };
        });
        e.preventDefault();
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
      e.preventDefault();
    }

    if (e.code === Inputs.arrowLeft) {
      setKeys((prev) => {
        return { ...prev, arrowLeft: false };
      });
      setMainBeforeMovedTime(null);
      e.preventDefault();
    }

    if (e.code === Inputs.arrowUp) {
      setKeys((prev) => {
        return { ...prev, arrowUp: false };
      });
      setMainBeforeMovedTime(null);
      e.preventDefault();
    }

    if (e.code === Inputs.arrowDown) {
      setKeys((prev) => {
        return { ...prev, arrowDown: false };
      });
      setMainBeforeMovedTime(null);
      e.preventDefault();
    }
  }, []);

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
  }, [onKeydown, onKeyup, part]);
  return (
    <div className={sceneStyle.container} ref={containerDom}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.characterContainer}>
        <div className={styles.mainCharacter} ref={mainContainer}>
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
    </div>
  );
};

export default SceneC;
