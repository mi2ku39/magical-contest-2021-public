import { IBeat } from "textalive-app-api";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default class QuantizedBars {
  protected _index: number;
  protected _firstBeat: IBeat;
  protected _bars: IBeat[];
  public phrase?: QuantizedPhrase;
  public segments: QuantizedSegment[];

  constructor(
    index: number,
    firstBeat: IBeat,
    bars: IBeat[],
    phrase?: QuantizedPhrase,
    segments?: QuantizedSegment[]
  ) {
    this._index = index;
    this._firstBeat = firstBeat;
    this._bars = bars;
    this.phrase = phrase;
    this.segments = segments ?? [];
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

  toString() {
    return `${this.index}.${this.firstBeat.position} Bars`;
  }
}
