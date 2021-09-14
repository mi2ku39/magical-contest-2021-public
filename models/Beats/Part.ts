import QuantizedBar from "./QuantizedBar";

const partTypes = {
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
export type PartType = typeof partTypes[keyof typeof partTypes];

export default class Part {
  protected _index: number;
  protected _startBar: QuantizedBar;
  protected _endBar: QuantizedBar;
  protected _isSabi: boolean;
  protected _hasPhrase: boolean;
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

  get isSabi() {
    return this._isSabi;
  }

  get hasPhrase() {
    return this._hasPhrase;
  }

  get duration() {
    return this.endBar.startTime - this.startBar.startTime;
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
}
