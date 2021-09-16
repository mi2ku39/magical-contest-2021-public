import { IRepetitiveSegment, IRepetitiveSegments } from "textalive-app-api";
import QuantizedBar from "./QuantizedBar";

export default class QuantizedSegment {
  protected _current: IRepetitiveSegment;
  protected _parent: IRepetitiveSegments;
  protected _startBar: QuantizedBar;
  protected _endBar: QuantizedBar;
  protected _isSabi: boolean = false;
  constructor(
    currentSegment: IRepetitiveSegment,
    parentSegment: IRepetitiveSegments,
    startBar: QuantizedBar,
    endBar: QuantizedBar,
    isSabi?: boolean
  ) {
    this._current = currentSegment;
    this._parent = parentSegment;
    this._startBar = startBar;
    this._endBar = endBar;
    this._isSabi = isSabi ?? false;
  }

  get startBar(): QuantizedBar {
    return this._startBar;
  }

  get endBar(): QuantizedBar {
    return this._endBar;
  }

  get isSabi(): boolean {
    return this._isSabi;
  }

  get current() {
    return this._current;
  }

  get parent() {
    return this._parent;
  }

  get duration() {
    return this.endBar.startTime - this.startBar.startTime;
  }
}
