import { IBeat, IPhrase, IRepetitiveSegments } from "textalive-app-api";
import QuantizingBars from "./QuantizingBars";
import Quantizer from "./Quantizer";

export default class QuantizedSong {
  protected _beats: IBeat[];
  protected _rawPhrases: IPhrase[];
  protected _rawSegments: IRepetitiveSegments[];
  protected _map?: Map<number, QuantizingBars>;

  get bars() {
    return this._map
      ? Array.from(this._map.entries()).map(([key, value]) => value)
      : [];
  }

  get phrases() {
    return this.bars ? Quantizer.plucPhrases(this.bars) : [];
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
    const bars: QuantizingBars[] = Quantizer.parseBars(this._beats);
    Quantizer.quantizePhrases(bars, this._rawPhrases);
    this._rawSegments.forEach((it) => {
      Quantizer.quantizeSegments(bars, it);
    });
    Quantizer.adjustPhrases(bars);
    Quantizer.adjustSegments(bars);

    this._map = new Map();
    bars.forEach((it) => this._map.set(it.firstBeat.index, it));
  }

  public find(index: number) {
    return this._map ? this._map.get(index) : null;
  }
}
