import { IBeat } from "textalive-app-api";
import Part from "./Part";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default class QuantizedBar {
  protected _index: number;
  protected _firstBeat: IBeat;
  protected _beats: IBeat[];
  previous?: QuantizedBar;
  next?: QuantizedBar;
  phrase?: QuantizedPhrase;
  segment?: QuantizedSegment;
  part?: Part;

  constructor(
    index: number,
    firstBeat: IBeat,
    beats: IBeat[],
    phrase?: QuantizedPhrase,
    segment?: QuantizedSegment
  ) {
    this._index = index;
    this._firstBeat = firstBeat;
    this._beats = beats;
    this.phrase = phrase;
    this.segment = segment;
  }

  get index(): number {
    return this._index;
  }

  get startBeat(): IBeat {
    return this._firstBeat;
  }

  get endBeat(): IBeat {
    return this.beats[this.beats.length - 1];
  }

  get startTime(): number {
    return this._firstBeat.startTime;
  }

  get endTime(): number {
    return this.endBeat.endTime;
  }

  get length(): number {
    return this._beats.reduce((total, it) => total + it.length, 0);
  }

  get beats() {
    return this._beats;
  }

  get duration(): number {
    return this.beats.reduce((sum, it) => sum + it.duration, 0);
  }

  toString() {
    return `${this.index}.${this.startBeat.position} Bars`;
  }

  contains(position: number): boolean {
    return (
      this.startTime < position &&
      (!this.next || position < this.next.startTime)
    );
  }
}
