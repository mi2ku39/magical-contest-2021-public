import { IRepetitiveSegment, IRepetitiveSegments } from "textalive-app-api";
import QuantizedBars from "./QuantizedBars";

export default class QuantizedSegment {
  protected _current: IRepetitiveSegment;
  protected _parent: IRepetitiveSegments;
  protected _startBar: QuantizedBars;
  protected _endBar: QuantizedBars;
  constructor(
    currentSegment: IRepetitiveSegment,
    parentSegment: IRepetitiveSegments,
    startBar: QuantizedBars,
    endBar: QuantizedBars
  ) {
    this._current = currentSegment;
    this._parent = parentSegment;
    this._startBar = startBar;
    this._endBar = endBar;
  }

  get current() {
    return this._current;
  }

  get parent() {
    return this._parent;
  }
}
