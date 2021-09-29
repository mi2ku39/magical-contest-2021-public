import clsx from "clsx";
import React, {
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
import { Hints, Inputs, SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneD.module.scss";

const SceneD: React.FC<SceneProps> = ({
  position,
  beat,
  bar,
  phrase,
  part,
  isPlaying,
  isParentMounted,
  isShowedArrowHint,
  addNoteCount,
  pushShowedHint,
}) => {
  const animationPlayState = useMemo<string>(
    () => (isPlaying ? "running" : "paused"),
    [isPlaying]
  );

  /**
   * 主人公の動き関係
   */

  const Directions = {
    none: 0,
    right: 1,
    left: 2,
  };
  type Direction = typeof Directions[keyof typeof Directions];
  const [keys, setKeys] = useState<{ arrowRight: boolean; arrowLeft: boolean }>(
    { arrowRight: false, arrowLeft: false }
  );

  const mainContainer = useRef<HTMLDivElement>();
  const popupWalkNote = useCallback(() => {
    if (!document) return;

    const dom = document.createElement("div");
    dom.className = styles.soundNote;
    dom.setAttribute(
      "style",
      `animation-duration: ${beat.duration}ms !important`
    );
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
  const [paradeBeforeMovedTime, setParadeBeforeMovedTime] =
    useState<number>(null);
  const [paradeMovedDistance, setParadeMovedDistance] = useState<number>(0);

  useEffect(() => {
    let paradeDiff = 0;
    if (paradeBeforeMovedTime === null) {
      paradeDiff = 0;
    } else {
      paradeDiff = position - paradeBeforeMovedTime;
    }

    setParadeMovedDistance(
      (prev) => prev + (paradeDiff / beat.duration) * 12.5
    );
    setParadeBeforeMovedTime(position);

    if (mainMoveDirection === Directions.none) return;

    let diff = 0;
    if (mainBeforeMovedTime === null) {
      diff = 0;
    } else {
      diff = position - mainBeforeMovedTime;
    }
    const movingTime = (diff / beat.duration) * 50;
    if (mainMoveDirection === Directions.left) {
      setMainMovedDistance((prev) => {
        const distance = prev + movingTime;
        return distance > paradeMovedDistance ? paradeMovedDistance : distance;
      });
    }

    if (mainMoveDirection === Directions.right) {
      setMainMovedDistance((prev) => prev - movingTime);
    }

    setMainBeforeMovedTime(position);
  }, [position]);

  useEffect(() => {
    if (mainMoveDirection === Directions.left) {
      if (addNoteCount) {
        addNoteCount();
        popupWalkNote();
      }
    }
  }, [beat]);

  const mainIllust = useMemo(
    () =>
      !beat || !isMoving || beat.position % 2 === 1
        ? Illustration.main.walk
        : Illustration.main.walkAlt,
    [beat, isMoving]
  );

  const mikuIllust = useMemo(
    () =>
      !beat || !isMoving || beat.position % 2 === 1
        ? Illustration.miku.walk
        : Illustration.miku.walkAlt,
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
        marginRight: !isRight && "-6rem",
        marginLeft: isRight && "-6rem",
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
      marginRight: isLeft && "-6rem",
      marginLeft: !isLeft && "-6rem",
    };
  }, [position, beat, mainBeforeDeg, mainBeforeDirection, mainMoveDirection]);

  /**
   * 一緒に行進する人たち関係
   */

  const paradeAnimationDuration = useMemo(
    () =>
      part
        ? part.bars.reduce(
            (total, it) =>
              total +
              it.beats.reduce((total2, it2) => total2 + it2.duration, 0) /
                it.beats.length,
            0
          ) / part.bars.length
        : 0,
    [part]
  );

  const paradeAnimationStyle = useMemo<CSSProperties>(() => {
    return {
      animationDuration: `${paradeAnimationDuration}ms`,
      animationPlayState,
    };
  }, [paradeAnimationDuration, animationPlayState]);

  const paradeStyle = useMemo<CSSProperties>(() => {
    const translate = paradeMovedDistance - mainMovedDistance;

    return {
      transform: `translateX(${translate < 0 ? 0 : -1 * translate}px)`,
    };
  }, [paradeMovedDistance, mainMovedDistance]);

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
  }, []);

  useEffect(() => {
    if (window) {
      window.addEventListener("keydown", onKeydown);
      window.addEventListener("keyup", onKeyup);
    }
    return () => {
      if (window) {
        window.removeEventListener("keydown", onKeydown);
        window.removeEventListener("keyup", onKeyup);
      }
    };
  }, [onKeydown, onKeyup]);

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.hintContainer}>
        <div
          className={clsx(
            styles.hintElement,
            isShowedArrowHint && styles.hiddenHint
          )}
        >
          <KeyHint left />
          <div>を押してみよう！</div>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.miku} style={paradeStyle}>
          <div style={paradeAnimationStyle}>
            <img className={styles.illust} src={mikuIllust} />
          </div>
        </div>
        <div className={styles.main} ref={mainContainer}>
          <div className={styles.mainInner} style={mainStyle}>
            <img className={styles.illust} src={mainIllust} />
          </div>
        </div>
        <div style={paradeStyle}>
          <div style={paradeAnimationStyle}>
            <DummyImage height="23rem" width="10rem" />
          </div>
        </div>
        <div style={paradeStyle}>
          <div style={paradeAnimationStyle}>
            <DummyImage height="23rem" width="10rem" />
          </div>
        </div>
        <div style={paradeStyle}>
          <div style={paradeAnimationStyle}>
            <DummyImage height="23rem" width="10rem" />
          </div>
        </div>
        <div style={paradeStyle}>
          <div style={paradeAnimationStyle}>
            <DummyImage height="23rem" width="10rem" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneD;
