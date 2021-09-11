import { IPhrase } from "textalive-app-api";
import QuantizedBars from "./QuantizedBars";

export default class QuantizedPhrase {
  protected _startBar: QuantizedBars;
  protected _endBar: QuantizedBars;
  protected _phrase: IPhrase;

  constructor(
    phrase: IPhrase,
    startBars: QuantizedBars,
    endBar: QuantizedBars
  ) {
    this._startBar = startBars;
    this._endBar = endBar;
    this._phrase = phrase;
  }

  get startBar() {
    return this._startBar;
  }

  get endBar() {
    return this._endBar;
  }

  get phrase() {
    return this._phrase;
  }

  get startTime() {
    return this.phrase.startTime;
  }
}
