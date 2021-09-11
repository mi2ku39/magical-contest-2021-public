import { IBeat, IPhrase } from "textalive-app-api";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default class QuantizedBars {
  protected _firstBeat: IBeat;
  protected _bars: IBeat[];
  public phrase?: QuantizedPhrase;
  public segment?: QuantizedSegment;

  constructor(
    firstBeat: IBeat,
    bars: IBeat[],
    phrase?: QuantizedPhrase,
    segment?: QuantizedSegment
  ) {
    this._firstBeat = firstBeat;
    this._bars = bars;
    this.phrase = phrase;
    this.segment = segment;
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
}
