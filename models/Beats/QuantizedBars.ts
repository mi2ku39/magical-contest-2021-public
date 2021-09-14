import { IBeat } from "textalive-app-api";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default class QuantizedBars {
  protected _index: number;
  protected _firstBeat: IBeat;
  protected _bars: IBeat[];
  protected _phrase?: QuantizedPhrase;
  protected _segment: QuantizedSegment;

  constructor(
    index: number,
    firstBeat: IBeat,
    bars: IBeat[],
    phrase?: QuantizedPhrase,
    segment?: QuantizedSegment
  ) {
    this._index = index;
    this._firstBeat = firstBeat;
    this._bars = bars;
    this._phrase = phrase;
    this._segment = segment;
  }

  get index(): number {
    return this._index;
  }

  get firstBeat(): IBeat {
    return this._firstBeat;
  }

  get startTime(): number {
    return this._firstBeat.startTime;
  }

  get length(): number {
    return this._bars.reduce((total, it) => total + it.length, 0);
  }

  get phrase() {
    return this._phrase;
  }

  get segment() {
    return this._segment;
  }

  toString() {
    return `${this.index}.${this.firstBeat.position} Bars`;
  }
}
