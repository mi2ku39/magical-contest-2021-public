import { CSSProperties, useEffect, useMemo } from "react";
import DummyImage from "~/components/DummyImage";
import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneG.module.scss";

const SceneG: React.FC<SceneProps> = ({
  part,
  position,
  beat,
  bar,
  phrase,
  isPlaying,
}) => {
  const animationPlayState = useMemo<string>(
    () => (isPlaying ? "running" : "paused"),
    [isPlaying]
  );
  const averageBarDuration = useMemo(
    () =>
      !!part
        ? part.bars.reduce((total, it) => total + it.duration, 0) /
          part.bars.length
        : 0,
    [part]
  );
  const waveStyle = useMemo<CSSProperties>(() => {
    return {
      animationPlayState,
      animationDuration: `${averageBarDuration}ms`,
    };
  }, [averageBarDuration, animationPlayState]);

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.tvContainer}>
          <div>
            <DummyImage height="10rem" width="14rem" />
          </div>
          <div className={styles.waveContainer}>
            <div style={{ ...waveStyle }}></div>
            <div
              style={{
                ...waveStyle,
                animationDelay: `${averageBarDuration * (1 / 4)}ms`,
              }}
            ></div>
            <div
              style={{
                ...waveStyle,
                animationDelay: `${averageBarDuration * (2 / 4)}ms`,
              }}
            ></div>
            <div
              style={{
                ...waveStyle,
                animationDelay: `${averageBarDuration * (3 / 4)}ms`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneG;
