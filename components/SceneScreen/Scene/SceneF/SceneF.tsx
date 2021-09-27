import clsx from "clsx";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DummyImage from "~/components/DummyImage";
import { Hints, SceneDragEvent, SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneF.module.scss";

const SceneF: React.FC<SceneProps> = ({
  isPlaying,
  isParentMounted,
  isShowedDragHint,
  phrase,
  part,
  beat,
  setRenderOnDragStartListeners,
  setRenderOnDragMoveListeners,
  setRenderOnDragEndListeners,
  pushShowedHint,
}) => {
  const animationPlayState = useMemo<string>(
    () => (isPlaying ? "running" : "paused"),
    [isPlaying]
  );
  const performerRef = useRef<HTMLDivElement>();
  const [performerTransitionTime, setPerformerTransitionTime] =
    useState<number>(0);
  const [performerScaleY, setPerformerScaleY] = useState<number>(1);
  const [performerTranslateX, setPerformerTranslateX] = useState<number>(0);
  const [performerDeg, setPerformerDeg] = useState<number>(0);

  const performerStyle = useMemo<CSSProperties>(() => {
    return isPlaying
      ? {
          transition: `transform ${performerTransitionTime}ms`,
          transform: `translateX(${performerTranslateX}px) skewX(${performerDeg}deg) translateY(${
            (performerScaleY - 1) * -50
          }%) scaleY(${performerScaleY})`,
        }
      : {
          transition: `transform ${performerTransitionTime}ms`,
          transform: `translateX(0px) skewX(0deg) translateY(0%) scaleY(1)`,
        };
  }, [
    performerTransitionTime,
    performerScaleY,
    performerTranslateX,
    performerDeg,
  ]);

  const setStyle = useCallback<(e: SceneDragEvent) => void>(
    (e) => {
      const domRect = performerRef.current.getBoundingClientRect();
      const center = {
        x: domRect.x + domRect.width / 2,
        y: domRect.y + domRect.height,
      };

      const rawDeg =
        Math.atan2(e.clientX - center.x, e.clientY - center.y) *
          (180 / Math.PI) +
        180;
      const deg = rawDeg > 180 ? rawDeg - 360 : rawDeg;

      setPerformerDeg(deg);
      setPerformerTranslateX(
        (domRect.height / 2) * Math.tan((Math.PI / 180) * deg) * -1
      );
      setPerformerScaleY(
        ((e.clientY - (center.y - domRect.height)) * -1) / domRect.height + 1
      );
    },
    [performerRef]
  );

  const onDragStart = useCallback<(e: SceneDragEvent) => void>(
    (e) => {
      setPerformerTransitionTime(0);
      setStyle(e);
    },
    [setStyle]
  );

  const onDragMove = useCallback<(e: SceneDragEvent) => void>(
    (e) => {
      setStyle(e);
      if (isPlaying) pushShowedHint(Hints.dragHint);
    },
    [setStyle, pushShowedHint]
  );

  const onDragEnd = useCallback<(e: SceneDragEvent) => void>(
    (e) => {
      setPerformerTransitionTime(beat.duration / 4);
      setPerformerDeg(0);
      setPerformerScaleY(1);
      setPerformerTranslateX(0);
    },
    [beat]
  );

  const averageBeatDuration = useMemo<number>(
    () =>
      part?.bars.reduce((total, it) => it.duration + total, 0) /
        part.bars.length ?? 0,
    [part]
  );

  const speakerStyle = useMemo<CSSProperties>(() => {
    return {
      animationDuration: `${averageBeatDuration * (1 / 4)}ms`,
      animationDelay: `${averageBeatDuration * (3 / 4)}ms`,
      animationPlayState,
    };
  }, [averageBeatDuration, animationPlayState]);

  useEffect(() => {
    if (isParentMounted) {
      setRenderOnDragStartListeners((prev) => {
        if (!prev.includes(onDragStart)) {
          return [...prev, onDragStart];
        }
        return prev;
      });
      setRenderOnDragMoveListeners((prev) => {
        if (!prev.includes(onDragMove)) {
          return [...prev, onDragMove];
        }
        return prev;
      });
      setRenderOnDragEndListeners((prev) => {
        if (!prev.includes(onDragEnd)) {
          return [...prev, onDragEnd];
        }
        return prev;
      });
    }

    return () => {
      if (isParentMounted) {
        setRenderOnDragStartListeners((prev) => {
          if (prev.includes(onDragStart)) {
            return prev.filter((it) => it !== onDragStart);
          }
        });
        setRenderOnDragMoveListeners((prev) => {
          if (prev.includes(onDragMove)) {
            return prev.filter((it) => it !== onDragMove);
          }
        });
        setRenderOnDragEndListeners((prev) => {
          if (prev.includes(onDragEnd)) {
            return prev.filter((it) => it !== onDragEnd);
          }
        });
      }
    };
  }, [
    isParentMounted,
    setRenderOnDragStartListeners,
    setRenderOnDragMoveListeners,
    setRenderOnDragEndListeners,
    onDragMove,
    onDragEnd,
  ]);

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.hintContainer}>
        <div className={styles.hintElement}>
          <div
            className={clsx(styles.hint, isShowedDragHint && styles.hiddenHint)}
          >
            <div>画面をドラッグ操作してみよう！</div>
          </div>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.imageInner}>
          <div className={styles.onStageContainer}>
            <div className={styles.performerContainer}>
              <div ref={performerRef}>
                <div style={performerStyle}>
                  <DummyImage width="10rem" height="20rem" />
                </div>
              </div>
            </div>
            <div className={styles.machineContainer}>
              <div className={styles.leftSpeaker} style={speakerStyle}>
                <DummyImage width="8rem" height="15rem" />
              </div>
              <div className={styles.leftMic}>
                <DummyImage width="6rem" height="4rem" />
              </div>
              <div className={styles.rightMic}>
                <DummyImage width="6rem" height="4rem" />
              </div>
              <div className={styles.rightSpeaker} style={speakerStyle}>
                <DummyImage width="8rem" height="15rem" />
              </div>
            </div>
          </div>
          <div className={styles.stageContainer}>
            <DummyImage width="70rem" height="6rem" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneF;
