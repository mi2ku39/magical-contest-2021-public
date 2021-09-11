import { CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import QuantizedSong from "~/models/Beats/QuantizedSong";
import styles from "./QuantizedSongScreen.module.scss";

type Props = {
  startTime: number;
  endTime: number;
  now: number;
  quantizedSong: QuantizedSong;
  hiddenDetailTable?: boolean;
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
  const scaler = useCallback<
    (time: number, isEanbleOffset?: boolean) => number
  >(
    (time, isEnableOffset = false) =>
      (time - (isEnableOffset ? startTime : 0)) / (endTime - startTime),
    [startTime, endTime]
  );

  const progressBarStyle = useMemo<CSSProperties>(() => {
    return {
      transform: `translateX(${
        guageWidth * scaler(now, true) > guageWidth
          ? guageWidth
          : guageWidth * scaler(now, true) - 1
      }px)`,
    };
  }, [now, guageWidth]);

  const segmentStyle = useCallback<
    (startTime: number, duration: number) => CSSProperties
  >(
    (startTime, duration) => {
      const translate = guageWidth * scaler(startTime, true);
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
    [scaler, guageWidth, quantizedSong]
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
        {quantizedSong && (
          <>
            {quantizedSong.bars.map((bars, i) => (
              <>
                <div
                  className={styles.beatBar}
                  style={beatStyle(bars.startTime)}
                />
                {bars.phrase && (
                  <div
                    className={styles.segment}
                    style={{
                      ...segmentStyle(
                        bars.phrase.startBar.startTime,
                        bars.phrase.duration
                      ),
                      borderColor: "rgba(255,255,0,0.5)",
                    }}
                  />
                )}
                {bars.segments &&
                  bars.segments.map((segment) => (
                    <div
                      className={styles.segment}
                      style={{
                        ...segmentStyle(bars.startTime, segment.duration),
                        borderColor: "rgba(255,0,255,0.5)",
                      }}
                    />
                  ))}
              </>
            ))}
          </>
        )}
      </div>
      {quantizedSong && !hiddenDetailTable && (
        <div>
          <table>
            <tbody>
              {quantizedSong.bars.map((it) => (
                <tr>
                  <td>{it.toString()}</td>
                  <td>{it.startTime} ms</td>
                  <td>
                    {it.phrase ? (
                      <>
                        {`${it.phrase.phrase.text}`}
                        <br />(
                        {`${Math.round(
                          it.phrase.phrase.startTime
                        )}ms ~ ${Math.round(it.phrase.phrase.endTime)}ms`}
                        )
                      </>
                    ) : (
                      <>
                        -<br />
                        ()
                      </>
                    )}
                  </td>
                  {it.segments?.map((segment) => (
                    <>
                      <td>
                        {segment.startBar.toString()} ~{" "}
                        {segment.endBar.toString()}
                        <br />({Math.round(segment.current.startTime)}ms ~{" "}
                        {Math.round(segment.current.endTime)}ms)
                      </td>
                    </>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
export default QuantizedSongScreen;
