import { useEffect, useMemo, useState } from "react";
import { SongleTimer } from "textalive-app-api";
import Illustration from "~/constants/Illustration";
import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneA.module.scss";

const SceneParts = { A: 1, B: 2, C: 3 };
type ScenePart = typeof SceneParts[keyof typeof SceneParts];

const SceneA: React.FC<SceneProps> = ({
  position,
  beat,
  bar,
  phrase,
  part,
  isPlaying,
  song,
}) => {
  const isVisible = useMemo(
    () => position >= part.startBar.startBeat.startTime,
    [position]
  );

  const animationPlayState = useMemo<string>(
    () => (isPlaying ? "running" : "paused"),
    [isPlaying]
  );

  const offset = useMemo(() => part.startBar.startBeat.startTime, [part]);
  const [mikuThrowDuration, setMikuThrowDuration] = useState<number>(0);
  const [mainThrowDelay, setMainThrowDelay] = useState<number>(0);
  const [mainThrowDuration, setMainThrowDuration] = useState<number>(0);
  const [titleCharacterDelay, setTitleCharacterDelay] = useState<number>(0);
  const [titleCharacterDuration, setTitleCharacterDuration] =
    useState<number>(0);
  const [titleDelay, setTitleDelay] = useState<number>(0);
  const [titleDuration, setTitleDuration] = useState<number>(0);
  const [walkCharacterSwitchBarIndex, setWalkCharacterSwitchBarIndex] =
    useState<number>(null);
  const isOddBeatPosition = useMemo<boolean>(
    () => beat.position % 2 === 1,
    [beat]
  );
  const walkIllust = useMemo<string>(() => {
    return bar.index < walkCharacterSwitchBarIndex
      ? isOddBeatPosition
        ? Illustration.miku.walkAlt
        : Illustration.miku.walk
      : isOddBeatPosition
      ? Illustration.main.walkAlt
      : Illustration.main.walk;
  }, [isOddBeatPosition, walkCharacterSwitchBarIndex, bar]);

  const scene = useMemo(() => {
    const localIndex = bar.index - part.startBar.index + 1;
    if (part.barLength < 4) {
      return SceneParts.A;
    } else {
      if (localIndex <= 3) {
        return SceneParts.A;
      }
      if (localIndex === 4) {
        return SceneParts.B;
      }

      return SceneParts.C;
    }
  }, [part, bar]);

  useEffect(() => {
    if (!part) {
    } else if (part.barLength < 4) {
      setTitleCharacterDelay(0);
      setTitleCharacterDuration(
        part.endBar.startTime - part.startBar.startTime
      );
    } else if (part.barLength === 4) {
      setMikuThrowDuration(
        part.startBar.startBeat.next.startTime -
          part.startBar.startBeat.startTime
      );

      setMainThrowDelay(part.startBar.startBeat.next.startTime - offset);
      setMainThrowDuration(
        part.startBar.startBeat.next.next.endTime -
          part.startBar.startBeat.next.startTime
      );

      setTitleCharacterDelay(
        part.startBar.startBeat.next.next.endTime -
          offset +
          part.startBar.startBeat.next.next.duration / 2
      );
      setTitleCharacterDuration(part.startBar.startBeat.next.next.duration / 2);

      setTitleDelay(part.startBar.next.startTime - offset);
      setTitleDuration(
        part.startBar.next.next.next.startTime - part.startBar.next.startTime
      );
    } else {
      setMikuThrowDuration(
        part.startBar.startBeat.next.startTime -
          part.startBar.startBeat.startTime
      );

      setMainThrowDelay(part.startBar.startBeat.next.startTime - offset);
      setMainThrowDuration(
        part.startBar.startBeat.next.next.endTime -
          part.startBar.startBeat.next.startTime
      );

      setTitleCharacterDelay(
        part.startBar.startBeat.next.next.endTime -
          offset +
          part.startBar.startBeat.next.next.duration / 2
      );
      setTitleCharacterDuration(part.startBar.startBeat.next.next.duration / 2);

      setTitleDelay(part.startBar.next.startTime - offset);
      setTitleDuration(
        part.startBar.next.next.next.startTime - part.startBar.next.startTime
      );

      const walkBar = part.startBar.next?.next?.next;
      if (walkBar) {
        const switchBarIndex = Math.floor(part.endBar.index - 4 / 2);
        if (switchBarIndex >= 1) setWalkCharacterSwitchBarIndex(switchBarIndex);
      }
    }
  }, [part]);

  return (
    <div className={sceneStyle.container}>
      {isVisible && (
        <>
          {scene === SceneParts.A && (
            <>
              <div className={styles.throwImgContainer}>
                <div
                  className={styles.mikuImgContainer}
                  style={{
                    animationDuration: `${mikuThrowDuration}ms`,
                    animationPlayState: animationPlayState,
                  }}
                >
                  <img src={Illustration.miku.walk} />
                </div>
                <div
                  className={styles.mainImgContainer}
                  style={{
                    animationDelay: `${mainThrowDelay}ms`,
                    animationDuration: `${mainThrowDuration}ms`,
                    animationPlayState: animationPlayState,
                  }}
                >
                  <img src={Illustration.main.fly} />
                </div>
              </div>
              <div
                className={styles.titleCharacterContainer}
                style={{
                  animationDelay: `${titleCharacterDelay}ms`,
                  animationDuration: `${titleCharacterDuration}ms`,
                  animationPlayState: animationPlayState,
                }}
              >
                <div className={styles.imgContainer}>
                  <img src={Illustration.miku.ftonSmileyColored} />
                </div>
              </div>
              <div className={styles.titleContainer}>
                <div
                  style={{
                    animationDelay: `${titleDelay}ms`,
                    animationDuration: `${titleDuration}ms`,
                    animationPlayState: animationPlayState,
                  }}
                >
                  {song.name}
                </div>
              </div>
            </>
          )}
          {scene === SceneParts.B && (
            <div className={styles.countContainer}>
              <div>{beat.position}</div>
            </div>
          )}
          {scene === SceneParts.C && (
            <div className={styles.walkContainer}>
              <div>
                <img
                  style={{
                    animationDuration: `${beat.duration}ms`,
                    animationPlayState: animationPlayState,
                  }}
                  src={walkIllust}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SceneA;
