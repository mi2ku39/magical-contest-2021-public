import {
  IBeat,
  IPhrase,
  IRepetitiveSegment,
  IRepetitiveSegments,
  TimedObject,
} from "textalive-app-api";
import QuantizedBars from "./QuantizedBars";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default class QuantizedSong {
  protected _beats: IBeat[];
  protected _phrases: IPhrase[];
  protected _segments: IRepetitiveSegments[];
  protected _map?: Map<number, QuantizedBars>;

  get bars() {
    return this._map
      ? Array.from(this._map.entries()).map(([key, value]) => value)
      : [];
  }

  get phrases() {
    return this.bars ? this.plucPhrases(this.bars) : [];
  }

  public constructor(
    beats: IBeat[],
    phrases: IPhrase[],
    segments: IRepetitiveSegments[]
  ) {
    this._beats = beats;
    this._phrases = phrases;
    this._segments = segments;
  }

  quantize() {
    const bars: QuantizedBars[] = this.parseBars(this._beats);
    this.quantizePhrases(bars, this._phrases);
    this._segments.forEach((it) => {
      this.quantizeSegments(bars, it);
    });

    this.adjustPhrases(bars);
    this.adjustSegments(bars);

    this._map = new Map();
    bars.forEach((it) => this._map.set(it.firstBeat.index, it));
  }

  protected parseBars(beats: IBeat[]): QuantizedBars[] {
    const array: QuantizedBars[] = [];
    let barsIndex = 1;
    beats.forEach((beat) => {
      if (beat.position === 1) {
        const bars: IBeat[] = [beat];
        for (let it = beat.next; it && it.position !== 1; it = it.next) {
          bars.push(it);
        }
        array.push(new QuantizedBars(barsIndex++, beat, bars));
      }
    });
    return array;
  }

  protected quantizePhrases(bars: QuantizedBars[], phrases: IPhrase[]) {
    phrases.forEach((phrase) => {
      const [startBar, endBar] = this.searchNearBars(bars, phrase);
      startBar.phrase = new QuantizedPhrase(phrase, startBar, endBar);
    });
  }

  protected quantizeSegments(
    bars: QuantizedBars[],
    segments: IRepetitiveSegments
  ) {
    segments.segments.forEach((segment) => {
      const [startBar, endBar] = this.searchNearBars(bars, segment);
      startBar.segments.push(
        new QuantizedSegment(
          segment,
          segments,
          startBar,
          endBar,
          segments.chorus
        )
      );
    });
  }

  protected adjustSegments(bars: QuantizedBars[]) {
    let s: QuantizedSegment[] = [];
    bars.forEach(({ segments }) => {
      if (segments)
        segments.forEach((it) => {
          s.push(it);
        });
    });
    s = s.sort((a, b) => a.startBar.index - b.startBar.index);

    const joinedSegments: QuantizedSegment[] = [];
    s.forEach((i) => {
      s.forEach((j) => {
        // 同じセグメント同士の比較あるいは処理済みセグメントならば何も行わない
        if (i === j || joinedSegments.includes(i) || joinedSegments.includes(j))
          return;

        // セグメントの区間が重なっていたら結合する
        if (
          i.startBar.index <= j.startBar.index &&
          j.startBar.index < i.endBar.index
        ) {
          if (i.endBar.index < j.endBar.index) {
            i.endBar = j.endBar;
          }
          i.isSabi = i.isSabi || j.isSabi;
          joinedSegments.push(j);
        }
      });
    });

    // 結合したセグメントを削除
    joinedSegments.forEach((it) => {
      it.startBar.segments = it.startBar.segments.filter(
        (segment) => segment !== it
      );
    });

    // セグメントとセグメントの間に1小節だけ隙間があったら前のセグメントを伸ばして埋める
    const adjusted: QuantizedSegment[] = [];
    bars.forEach(({ segments }) => {
      if (segments)
        segments.forEach((it) => {
          adjusted.push(it);
        });
    });
    adjusted.forEach((segment, i) => {
      const next = adjusted[i + 1];
      if (!next) return;

      if (next.startBar.index - segment.endBar.index === 1) {
        segment.endBar = next.startBar;
      }
    });
  }

  protected searchNearBars(bars: QuantizedBars[], obj: TimedObject) {
    const startBar = bars.reduce((min, current) => {
      if (min) {
        const diffMin = Math.abs(min.startTime - obj.startTime);
        const diffCurrent = Math.abs(current.startTime - obj.startTime);
        return diffMin > diffCurrent ? current : min;
      } else {
        return current;
      }
    }, null);

    const endBar = bars.reduce((min, current) => {
      if (min) {
        const diffMin = Math.abs(min.startTime - obj.endTime);
        const diffCurrent = Math.abs(current.startTime - obj.endTime);
        return diffMin > diffCurrent ? current : min;
      } else {
        return current;
      }
    }, null);

    return [startBar, endBar];
  }

  protected adjustPhrases(bars: QuantizedBars[]) {
    const ps = this.plucPhrases(bars);

    ps.forEach((phrase, i) => {
      const next = ps[i + 1];

      if (
        next?.phrase &&
        phrase &&
        next.startBar.index - phrase.endBar.index === 1
      ) {
        phrase.endBar = next.startBar;
      }
    });
  }

  protected plucPhrases(bars: QuantizedBars[]) {
    return bars.map((it) => it.phrase).filter((it) => !!it);
  }

  public find(index: number) {
    return this._map ? this._map.get(index) : null;
  }
}
