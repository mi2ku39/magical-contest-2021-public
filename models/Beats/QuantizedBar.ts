import { IBeat } from "textalive-app-api";
import Part from "./Part";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default class QuantizedBar {
  protected _index: number;
  protected _firstBeat: IBeat;
  protected _beats: IBeat[];
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

  get firstBeat(): IBeat {
    return this._firstBeat;
  }

  get startTime(): number {
    return this._firstBeat.startTime;
  }

  get length(): number {
    return this._beats.reduce((total, it) => total + it.length, 0);
  }

  get beats() {
    return this._beats;
  }

  toString() {
    return `${this.index}.${this.firstBeat.position} Bars`;
  }
}
