import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import KeyHint from "~/components/KeyHint";
import Illustration from "~/constants/Illustration";
import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneE.module.scss";

const SceneE: React.FC<SceneProps> = ({
  position,
  beat,
  bar,
  phrase,
  part,
  isShowedSpacebarHint,
}) => {
  type Circle = {
    index: number;
    position: number;
  };

  const LocalScenes = {
    A: 1,
    B: 2,
    C: 3,
  };
  type LocalScene = typeof LocalScenes[keyof typeof LocalScenes];

  const scene = useMemo(() => {
    if (part.barLength <= 4) {
      return LocalScenes.A;
    }

    if (part.endBar.index - 2 <= bar.index) {
      return LocalScenes.C;
    }

    if (part.endBar.index - 5 <= bar.index) {
      return LocalScenes.B;
    }

    return LocalScenes.A;
  }, [part, bar]);

  const [circles, setCircles] = useState<Circle[]>([]);
  const scaler = useCallback<(num: number) => number>(
    (num) =>
      1 + (num - position) / 1000 > 0 ? 1 + (num - position) / 1000 : 0,
    [position]
  );

  const opacity = useCallback<(num: number) => number>(
    (num) => {
      const ratio = (position / num) ** 64;
      return ratio > 1 ? 1 : ratio;
    },
    [position, scaler]
  );

  const illust = useMemo(() => {
    if (scene === LocalScenes.B) {
      return Illustration.miku.frontSmiley;
    }

    if (scene === LocalScenes.C) {
      return Illustration.miku.ftonSmileyColored;
    }
    return Illustration.miku.fron;
  }, [scene]);

  const [goneCircles, setGoneCircles] = useState<Circle[]>([]);
  const nearCircle = useMemo<Circle>(
    () =>
      circles.reduce(
        (prev, it) =>
          !prev ||
          Math.abs(prev.position - position) > Math.abs(it.position - position)
            ? it
            : prev,
        null
      ),
    [position, circles]
  );

  const judgeCircle = useCallback<(position: number) => void>(() => {}, [
    nearCircle,
    goneCircles,
  ]);

  const onKeydown = useCallback(
    (event: KeyboardEvent) => {},
    [position, judgeCircle]
  );

  useEffect(() => {
    if (part) {
      setCircles([]);
      setGoneCircles([]);
      part.bars.forEach((it) => {
        setCircles((prev) => {
          prev.push({ index: it.index, position: it.startTime });
          return prev;
        });
      });
    }
  }, [part]);

  useEffect(() => {
    if (window) {
      window.addEventListener("keydown", onKeydown);
    }

    return () => {
      if (window) {
        window.removeEventListener("keydown", onKeydown);
      }
    };
  }, [onKeydown]);

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.imageInner}>
          <img src={illust} />
        </div>
      </div>

      <div className={styles.hintContainer}>
        <div className={styles.hintElement}>
          <div
            className={clsx(
              styles.col,
              isShowedSpacebarHint && styles.hiddenHint
            )}
          >
            <div>リズムにあわせて</div>
            <div className={styles.hint}>
              <KeyHint space />
              <div>を押してみよう！</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.timingHint}></div>

      {circles.map((it) => (
        <div className={styles.circleContainer} key={it.index}>
          <div
            className={styles.circle}
            style={{
              transform: `scale(${scaler(it.position)})`,
              filter: `brightness(${
                2 - opacity(it.position)
              }) opacity(${opacity(it.position)})`,
            }}
          ></div>
        </div>
      ))}

      <div>{scene}</div>
    </div>
  );
};

export default SceneE;
