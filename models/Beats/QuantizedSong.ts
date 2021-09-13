import {
  IBeat,
  IPhrase,
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

    this.adjust(bars);

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
        new QuantizedSegment(segment, segments, startBar, endBar)
      );
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

  protected adjust(bars: QuantizedBars[]) {
    const ps = this.plucPhrases(bars);

    ps.forEach((phrase, i) => {
      const next = ps[i + 1];

      if (next?.phrase && phrase) {
        console.log(`${next.startBar.index} ${phrase.endBar.index}`);
      }

      if (
        next?.phrase &&
        phrase &&
        next.startBar.index - phrase.endBar.index === 1
      ) {
        console.log("のびる");
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
