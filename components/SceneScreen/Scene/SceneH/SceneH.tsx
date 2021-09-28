import { CSSProperties, useMemo } from "react";
import DummyImage from "~/components/DummyImage";
import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneH.module.scss";

const SceneH: React.FC<SceneProps> = ({
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

  const averageBeatDuration = useMemo<number>(
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

  const midoriSlideStyle = useMemo<CSSProperties>(() => {
    return {
      animationPlayState,
      animationDuration: `${part.duration}ms`,
    };
  }, [part, animationPlayState]);

  const midoriWalkStyle = useMemo<CSSProperties>(() => {
    return {
      animationPlayState,
      animationDuration: `${averageBeatDuration}ms`,
    };
  }, [animationPlayState, averageBeatDuration]);

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.jizoContainer}>
        <div>
          <DummyImage height="15rem" width="6rem" />
        </div>
      </div>
      <div className={styles.midoriContainer} style={midoriSlideStyle}>
        <div className={styles.inner} style={midoriWalkStyle}>
          <DummyImage height="23rem" width="10rem" />
        </div>
      </div>
    </div>
  );
};

export default SceneH;
