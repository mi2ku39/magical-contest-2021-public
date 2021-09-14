import { IPhrase } from "textalive-app-api";
import QuantizingBars from "./QuantizingBars";

export default class QuantizedPhrase {
  public startBar: QuantizingBars;
  public endBar: QuantizingBars;
  protected _phrase: IPhrase;

  constructor(
    phrase: IPhrase,
    startBars: QuantizingBars,
    endBar: QuantizingBars
  ) {
    this.startBar = startBars;
    this.endBar = endBar;
    this._phrase = phrase;
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
