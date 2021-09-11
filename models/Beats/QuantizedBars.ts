import { IBeat } from "textalive-app-api";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default class QuantizedBars {
  protected _firstBeat: IBeat;
  protected _bars: IBeat[];
  public phrase?: QuantizedPhrase;
  protected _segments: QuantizedSegment[];

  constructor(
    firstBeat: IBeat,
    bars: IBeat[],
    phrase?: QuantizedPhrase,
    segments?: QuantizedSegment[]
  ) {
    this._firstBeat = firstBeat;
    this._bars = bars;
    this.phrase = phrase;
    this._segments = segments ?? [];
  }

  get index(): number {
    return this._firstBeat.index;
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

  get segments() {
    return this._segments;
  }

  toString() {
    return `${Math.floor(this.firstBeat.index / this.firstBeat.length)}.${
      this.firstBeat.position
    } Bars`;
  }
}
