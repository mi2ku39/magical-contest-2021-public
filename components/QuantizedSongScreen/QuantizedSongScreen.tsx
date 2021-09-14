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
  }, [now, scaler, guageWidth]);

  const displayProgressNum = useMemo<string>(
    () =>
      `${
        Math.round(scaler(now) * 100) > 100
          ? 100
          : Math.round(scaler(now) * 100)
      }%`,
    [scaler, now]
  );

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
    [scaler, guageWidth]
  );

  const screenDom = useMemo(
    () =>
      quantizedSong && (
        <>
          {quantizedSong.bars.map(({ index, startTime }) => (
            <div
              key={index}
              className={styles.beatBar}
              style={beatStyle(startTime)}
            />
          ))}
          {quantizedSong.bars.map(
            ({ index, phrase }) =>
              phrase && (
                <div
                  key={index}
                  className={styles.segment}
                  style={{
                    ...segmentStyle(phrase.startBar.startTime, phrase.duration),
                    borderColor: "rgba(132,255,255,0.7)",
                  }}
                />
              )
          )}
          {/* {quantizedSong.bars.map(
            ({ startTime, segment }) =>
              segment && (
                <div
                  key={segment.startBar.index}
                  className={styles.segment}
                  style={{
                    ...segmentStyle(startTime, segment.duration),
                    borderColor: "rgba(255,0,255,0.7)",
                  }}
                >
                  {segment.isSabi ? "サビ" : null}
                </div>
              )
          )} */}
          {quantizedSong.bars.map(
            ({ startTime, part }) =>
              part && (
                <div
                  key={part.index}
                  className={styles.segment}
                  style={{
                    ...segmentStyle(startTime, part.duration),
                    borderColor: "rgba(0,0,0,1)",
                  }}
                >
                  {part.hasPhrase ? "うた" : null}
                  {part.hasPhrase && part.isSabi && <br />}
                  {part.isSabi ? "サビ" : null}
                </div>
              )
          )}
        </>
      ),
    [quantizedSong, beatStyle, segmentStyle]
  );

  const detailsTableDom = useMemo(
    () =>
      quantizedSong &&
      quantizedSong.bars.map((it) => (
        <tr key={it.index}>
          <td>{it.toString()}</td>
          <td>{it.startTime} ms</td>
          {it.phrase ? (
            <td>
              {`${it.phrase.phrase.text}`}
              <br />(
              {`${it.phrase.startBar.toString()} ~ ${it.phrase.endBar.toString()}`}
              )
            </td>
          ) : (
            <td>
              -<br />
              ()
            </td>
          )}
          {it.segment ? (
            <td>
              {it.segment.startBar.toString()} ~ {it.segment.endBar.toString()}
              <br />({Math.round(it.segment.current.startTime)}ms ~{" "}
              {Math.round(it.segment.current.endTime)}ms)
            </td>
          ) : (
            <td></td>
          )}
          {it.part ? (
            <td>
              {it.part.startBar.toString()} ~ {it.part.endBar.toString()}
            </td>
          ) : (
            <td></td>
          )}
        </tr>
      )),
    [quantizedSong]
  );

  return (
    <>
      <div className={styles.container} ref={guage}>
        <div className={styles.nowBar} style={progressBarStyle}>
          {displayBars ? displayBars : displayProgressNum}
        </div>
        {screenDom}
      </div>
      {!hiddenDetailTable && (
        <table>
          <tbody>{detailsTableDom}</tbody>
        </table>
      )}
    </>
  );
};
export default QuantizedSongScreen;
