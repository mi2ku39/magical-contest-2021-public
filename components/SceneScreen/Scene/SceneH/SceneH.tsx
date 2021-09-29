import { CSSProperties, useMemo } from "react";
import DummyImage from "~/components/DummyImage";
import Illustration from "~/constants/Illustration";
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

  const choIllust = useMemo(
    () =>
      !beat || beat.position % 2 === 1
        ? Illustration.character.cho.walk
        : Illustration.character.cho.walkAlt,
    [beat]
  );

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.jizoContainer}>
        <div>
          <img src={Illustration.character.sosen} className={styles.jizoImg} />{" "}
        </div>
      </div>
      <div className={styles.midoriContainer} style={midoriSlideStyle}>
        <div className={styles.inner} style={midoriWalkStyle}>
          <img src={choIllust} />
        </div>
      </div>
    </div>
  );
};

export default SceneH;
