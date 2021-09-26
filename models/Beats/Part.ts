import { IBeat } from "textalive-app-api";
import QuantizedBar from "./QuantizedBar";

export const PartTypes = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  H: "H",
  I: "I",
  J: "J",
};
export type PartType = typeof PartTypes[keyof typeof PartTypes];

export default class Part {
  protected _index: number;
  protected _startBar: QuantizedBar;
  protected _endBar: QuantizedBar;
  protected _isSabi: boolean;
  protected _hasPhrase: boolean;
  protected _bars: QuantizedBar[];
  protected _beats: IBeat[];
  public partType?: PartType;
  public next?: Part;
  public previous?: Part;

  get index() {
    return this._index;
  }

  get startBar() {
    return this._startBar;
  }

  get endBar() {
    return this._endBar;
  }

  get bars(): QuantizedBar[] {
    if (!this._bars) {
      const array: QuantizedBar[] = [];
      let bar = this.startBar;
      while (bar) {
        array.push(bar);
        bar = bar.next;
      }
      this._bars = array;
    }
    return this._bars;
  }

  get beats(): IBeat[] {
    if (!this._beats) {
      const bars = this.bars;
      const beats: IBeat[] = [];
      bars.forEach((it) => beats.push(...it.beats));
      this._beats = beats;
    }

    return this._beats;
  }

  get isSabi() {
    return this._isSabi;
  }

  get hasPhrase() {
    return this._hasPhrase;
  }

  get duration() {
    return this.endBar.startTime - this.startBar.startTime;
  }

  get barLength() {
    return this.endBar.index - this.startBar.index;
  }

  constructor(
    index: number,
    startBar: QuantizedBar,
    endBar: QuantizedBar,
    isSabi?: boolean,
    hasPhrase?: boolean
  ) {
    this._index = index;
    this._startBar = startBar;
    this._endBar = endBar;
    this._isSabi = isSabi ?? false;
    this._hasPhrase = hasPhrase ?? false;
  }

  contains(position: number) {
    return (
      this.startBar.startTime <= position && this.endBar.startTime >= position
    );
  }

  fresh() {
    this._bars = null;
    this._beats = null;
  }
}
