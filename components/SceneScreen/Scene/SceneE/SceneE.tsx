import clsx from "clsx";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import KeyHint from "~/components/KeyHint";
import Icon from "~/constants/Icon";
import Illustration from "~/constants/Illustration";
import { Hints, Inputs, SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneE.module.scss";

const SceneE: React.FC<SceneProps> = ({
  position,
  beat,
  bar,
  phrase,
  part,
  isShowedSpacebarHint,
  addNoteCount,
  pushShowedHint,
  isPlaying,
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

  const illust = useMemo(() => {
    if (scene === LocalScenes.B) {
      return Illustration.miku.frontSmiley;
    }

    if (scene === LocalScenes.C) {
      return Illustration.miku.ftonSmileyColored;
    }
    return Illustration.miku.fron;
  }, [scene]);

  const imageInner = useRef<HTMLDivElement>();

  const popupMusicNote = useCallback(() => {
    if (!document) return;

    const dom = document.createElement("div");
    dom.className = styles.musicNote;
    dom.setAttribute("style", `animation-duration: ${beat.duration}ms`);
    const img = document.createElement("img");
    img.src = Icon.musicNoteWH;
    dom.appendChild(img);

    imageInner?.current?.appendChild(dom);

    new Promise<void>((resolve) => {
      setTimeout(() => {
        imageInner?.current?.removeChild(dom);
        resolve();
      }, beat.duration + 100);
    });
  }, [imageInner, beat]);

  const [circles, setCircles] = useState<Circle[]>([]);
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
  const scaler = useCallback<(num: number) => number>(
    (num) =>
      1 + (num - position) / 1000 > 0 ? 1 + (num - position) / 1000 : 0,
    [position]
  );

  const opacity = useCallback<(circle: Circle) => number>(
    (circle) => {
      if (goneCircles.includes(circle)) return 0;

      const ratio = (position / circle.position) ** 64;
      return ratio > 1 ? 1 : ratio;
    },
    [position, scaler, goneCircles]
  );

  const judgeCircle = useCallback<(time: number) => void>(
    (time) => {
      if (
        !goneCircles.includes(nearCircle) &&
        Math.abs(nearCircle.position - time) <= 100
      ) {
        addNoteCount();
        popupMusicNote();
        setGoneCircles((prev) => {
          prev.push(nearCircle);
          return prev;
        });
      }
    },
    [nearCircle, goneCircles, popupMusicNote]
  );

  const onKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === Inputs.space) {
        if (isPlaying) pushShowedHint(Hints.spacebarHint);
        judgeCircle(position);
      }
    },
    [position, judgeCircle, pushShowedHint]
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
        <div className={styles.imageInner} ref={imageInner}>
          <img src={illust} />
          <div className={styles.musicNote}>
            <img src={Icon.musicNoteWH} />
          </div>
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
              filter: `brightness(${2 - opacity(it)}) opacity(${opacity(it)})`,
            }}
          ></div>
        </div>
      ))}

      <div>{scene}</div>
    </div>
  );
};

export default SceneE;
