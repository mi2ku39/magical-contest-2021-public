import { IPhrase } from "textalive-app-api";
import QuantizedBar from "./QuantizedBar";

export default class QuantizedPhrase {
  protected _startBar: QuantizedBar;
  protected _endBar: QuantizedBar;
  protected _phrase: IPhrase;

  constructor(phrase: IPhrase, startBars: QuantizedBar, endBar: QuantizedBar) {
    this._startBar = startBars;
    this._endBar = endBar;
    this._phrase = phrase;
  }

  get startBar(): QuantizedBar {
    return this._startBar;
  }

  get endBar(): QuantizedBar {
    return this._endBar;
  }

  get phrase() {
    return this._phrase;
  }

  get startTime() {
    return this.startBar.startTime;
  }

  get endTime() {
    return this.endBar.startTime;
  }

  get duration() {
    return this.endBar.startTime - this.startBar.startTime;
  }

  contains(position: number): boolean {
    return this.startTime < position && this.endTime > position;
  }
}
