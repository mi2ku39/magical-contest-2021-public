import { CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import { IRepetitiveSegments } from "textalive-app-api";
import styles from "./SegmentScreen.module.scss";

type Props = {
  startTime: number;
  endTime: number;
  now: number;
  seguments: IRepetitiveSegments[];
  hiddenDetailTable?: boolean;
};
const SegumentScreen: React.FC<Props> = ({
  startTime,
  endTime,
  now,
  seguments,
  hiddenDetailTable = false,
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
          : guageWidth * scaler(now)
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
    [scaler, guageWidth]
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
    [guageWidth]
  );

  return (
    <>
      <div className={styles.container} ref={guage}>
        <div className={styles.nowBar} style={progressBarStyle}>
          {Math.round(scaler(now) * 100) > 100
            ? 100
            : Math.round(scaler(now) * 100)}
          %
        </div>
        {seguments &&
          seguments.map((parentSegument, i) => {
            const borderColor =
              i % 6 === 0
                ? "#F00"
                : i % 6 === 1
                ? "#0F0"
                : i % 6 === 2
                ? "#00F"
                : i % 6 === 3
                ? "#ff0"
                : i % 6 === 4
                ? "#f0f"
                : i % 6 === 5
                ? "#0ff"
                : "#000";
            return parentSegument.segments.map((it, j) => (
              <div
                key={`${i}-${j}`}
                className={styles.segument}
                style={{
                  ...segumentStyle(it.startTime, parentSegument.duration),
                  borderColor,
                }}
              >
                {parentSegument.chorus && "サビ"}
              </div>
            ));
          })}
      </div>
      {!hiddenDetailTable && (
        <div>
          <table>
            <tbody>
              {seguments.map((parentSegument, i) =>
                parentSegument.segments.map((it, j) => (
                  <tr key={`${i}-${j}`}>
                    <td>{i}</td>
                    <td>{parentSegument.chorus.toString()}</td>
                    <td>{parentSegument.duration}</td>
                    <td>{it.startTime}</td>
                    <td>{it.endTime}</td>
                    <td>
                      {Math.round(scaler(parentSegument.duration) * 100)}%
                    </td>
                    <td>{Math.round(scaler(it.startTime) * 100)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
export default SegumentScreen;
