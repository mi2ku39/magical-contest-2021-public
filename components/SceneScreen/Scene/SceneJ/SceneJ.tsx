import { CSSProperties, useEffect, useMemo, useState } from "react";
import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneJ.module.scss";

const SceneJ: React.FC<SceneProps> = ({
  isPlaying,
  song,
  part,
  bar,
  position,
}) => {
  const LocalScenes = {
    A: 1,
    B: 2,
  };
  type LocalScene = typeof LocalScenes[keyof typeof LocalScenes];

  const scene = useMemo<LocalScene>(() => {
    if (bar.index - part.startBar.index >= part.barLength / 2) {
      return LocalScenes.B;
    }

    return LocalScenes.A;
  }, [bar]);

  const animationPlayState = useMemo<string>(
    () => (isPlaying ? "running" : "paused"),
    [isPlaying]
  );

  const [titleAnimationDuration, setTitleAnimationDuration] =
    useState<number>(null);

  const titleStyle = useMemo<CSSProperties>(() => {
    return {
      animationPlayState,
      animationDuration: `${titleAnimationDuration ?? 0}ms`,
    };
  }, [titleAnimationDuration, animationPlayState]);

  useEffect(() => {
    setTitleAnimationDuration(
      part.bars
        .filter((it) => it.index - part.startBar.index >= part.barLength / 2)
        .reduce((total, it) => total + it.duration, 0)
    );
  }, [part]);

  return (
    <div className={sceneStyle.container}>
      {song && (
        <>
          {scene === LocalScenes.A && (
            <div className={styles.titleContainer}>
              <div style={titleStyle}>{song.name}</div>
            </div>
          )}
          {scene === LocalScenes.B && (
            <div className={styles.staffContainer}>
              <div className={styles.container}>
                <div className={styles.title}>密かなるにじそうさく</div>
                <div className={styles.authorContainer}>
                  <div>企画・制作</div>
                  <div>倉重みつき</div>
                  <div>イラスト協力</div>
                  <div>nowa</div>
                  <div>モチーフ</div>
                  <div>
                    濁茶<span className={styles.small}>様</span>
                    「密かなる交信曲」
                  </div>
                  <div className={styles.copyright}>
                    &copy; 2021 Mitsuki Kurashige, GhostServer.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SceneJ;
