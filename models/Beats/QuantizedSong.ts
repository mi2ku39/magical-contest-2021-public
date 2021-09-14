import { IBeat, IPhrase, IRepetitiveSegments } from "textalive-app-api";
import QuantizingBar from "./QuantizingBar";
import Quantizer from "./Quantizer";
import QuantizedBar from "./QuantizedBar";

export default class QuantizedSong {
  protected _beats: IBeat[];
  protected _rawPhrases: IPhrase[];
  protected _rawSegments: IRepetitiveSegments[];
  protected _map?: Map<number, QuantizedBar>;

  get bars() {
    return this._map
      ? Array.from(this._map.entries()).map(([key, value]) => value)
      : [];
  }

  get phrases() {
    return this.bars
      ? this.bars.map((it) => it.phrase).filter((it) => !!it)
      : [];
  }

  public constructor(
    beats: IBeat[],
    phrases: IPhrase[],
    segments: IRepetitiveSegments[]
  ) {
    this._beats = beats;
    this._rawPhrases = phrases;
    this._rawSegments = segments;
  }

  quantize() {
    const bars: QuantizingBar[] = Quantizer.parseBars(this._beats);
    Quantizer.quantizePhrases(bars, this._rawPhrases);
    this._rawSegments.forEach((it) => {
      Quantizer.quantizeSegments(bars, it);
    });
    Quantizer.adjustPhrases(bars);
    Quantizer.adjustSegments(bars);

    this._map = new Map();
    bars.forEach((it) => this._map.set(it.firstBeat.index, it.quantizedBars));
  }

  public find(index: number) {
    return this._map ? this._map.get(index) : null;
  }
}
