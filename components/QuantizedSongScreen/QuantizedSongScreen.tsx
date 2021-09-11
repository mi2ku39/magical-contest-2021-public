import { CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import QuantizedSong from "~/models/Beats/QuantizedSong";
import styles from "./QuantizedSongScreen.module.scss";

type Props = {
  startTime: number;
  endTime: number;
  now: number;
  quantizedSong: QuantizedSong;
  hiddenDetailTable: boolean;
  displayBars?: string;
};
const QuantizedSongScreen: React.FC<Props> = ({
  startTime,
  endTime,
  now,
  quantizedSong,
  hiddenDetailTable = false,
  displayBars,
}) => {
  const guage = useRef<HTMLDivElement>();
  const guageWidth = useMemo<number>(
    () => guage?.current?.clientWidth ?? 0,
    [guage, guage?.current?.clientWidth ?? 0]
  );
  const scaler = useCallback<(time: number) => number>(
    (time) => (time - startTime) / (endTime - startTime),
    [startTime, endTime]
  );

  const progressBarStyle = useMemo<CSSProperties>(() => {
    return {
      transform: `translateX(${
        guageWidth * scaler(now) > guageWidth
          ? guageWidth
          : guageWidth * scaler(now) - 1
      }px)`,
    };
  }, [now, guageWidth]);

  const segumentStyle = useCallback<
    (startTime: number, duration: number) => CSSProperties
  >(
    (startTime, duration) => {
      const translate = guageWidth * scaler(startTime);
      const width = guageWidth * scaler(duration);

      return {
        transform: `translateX(${translate}px)`,
        width: `${width}px`,
      };
    },
    [scaler, guageWidth, quantizedSong]
  );

  const beatStyle = useCallback<(time: number) => CSSProperties>(
    (time) => {
      return {
        transform: `translateX(${
          guageWidth * scaler(time) > guageWidth
            ? guageWidth
            : guageWidth * scaler(time)
        }px)`,
      };
    },
    [guageWidth, quantizedSong]
  );

  const displayProgressNum = useMemo<string>(
    () =>
      `${
        Math.round(scaler(now) * 100) > 100
          ? 100
          : Math.round(scaler(now) * 100)
      }%`,
    [scaler, now]
  );

  return (
    <>
      <div className={styles.container} ref={guage}>
        <div className={styles.nowBar} style={progressBarStyle}>
          {displayBars ? displayBars : displayProgressNum}
        </div>
        {quantizedSong &&
          quantizedSong.bars.map((beats, i) => (
            <div
              key={i}
              className={styles.beatBar}
              style={beatStyle(beats.startTime)}
            ></div>
          ))}
      </div>
      {!hiddenDetailTable && <div></div>}
    </>
  );
};
export default QuantizedSongScreen;
