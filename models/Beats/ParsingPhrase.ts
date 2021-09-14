import { IPhrase } from "textalive-app-api";
import ParsingBar from "./ParsingBar";

export default class ParsingPhrase {
  public startBar: ParsingBar;
  public endBar: ParsingBar;
  protected _phrase: IPhrase;

  constructor(phrase: IPhrase, startBars: ParsingBar, endBar: ParsingBar) {
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
