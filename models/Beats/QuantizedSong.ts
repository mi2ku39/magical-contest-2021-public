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

    this._map = new Map();
    bars.forEach((it) => this._map.set(it.index, it));
  }

  protected parseBars(beats: IBeat[]): QuantizedBars[] {
    const array: QuantizedBars[] = [];
    beats.forEach((beat) => {
      if (beat.position === 1) {
        const bars: IBeat[] = [beat];
        for (let it = beat.next; it && it.position !== 1; it = it.next) {
          bars.push(it);
        }
        array.push(new QuantizedBars(beat, bars));
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
      startBar.segment = new QuantizedSegment(
        segment,
        segments,
        startBar,
        endBar
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
}
