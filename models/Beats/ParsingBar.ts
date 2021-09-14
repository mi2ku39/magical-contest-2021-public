import { IBeat } from "textalive-app-api";
import ParsingPhrase from "./ParsingPhrase";
import ParsingSegment from "./ParsingSegment";

export default class ParsingBar {
  protected _index: number;
  protected _firstBeat: IBeat;
  protected _beats: IBeat[];
  public phrase?: ParsingPhrase;
  public segments: ParsingSegment[];

  constructor(
    index: number,
    firstBeat: IBeat,
    bars: IBeat[],
    phrase?: ParsingPhrase,
    segments?: ParsingSegment[]
  ) {
    this._index = index;
    this._firstBeat = firstBeat;
    this._beats = bars;
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

  get beats(): IBeat[] {
    return this._beats;
  }

  get length(): number {
    return this._beats.reduce((total, it) => total + it.length, 0);
  }

  toString() {
    return `${this.index}.${this.firstBeat.position} Bars`;
  }
}
