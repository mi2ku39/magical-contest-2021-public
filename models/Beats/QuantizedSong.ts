import { IBeat, IPhrase, IRepetitiveSegments } from "textalive-app-api";
import ParsingBar from "./ParsingBar";
import Quantizer from "./Quantizer";
import QuantizedBar from "./QuantizedBar";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

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
    const bars: ParsingBar[] = Quantizer.parseBars(this._beats);
    Quantizer.quantizePhrases(bars, this._rawPhrases);
    this._rawSegments.forEach((it) => {
      Quantizer.quantizeSegments(bars, it);
    });
    Quantizer.adjustPhrases(bars);
    Quantizer.adjustSegments(bars);

    const quantizingMap = new Map<number, ParsingBar>();
    const quantizedMap = new Map<number, QuantizedBar>();
    const quantizedBars: QuantizedBar[] = bars.map((it) => {
      const quantized = new QuantizedBar(it.index, it.firstBeat, it.beats);
      quantizingMap.set(it.index, it);
      quantizedMap.set(quantized.index, quantized);
      return quantized;
    });
    quantizedBars.forEach((bar) => {
      const before = quantizingMap.get(bar.index);
      if (!before) return;

      if (before.phrase) {
        const startBar = quantizedMap.get(before.phrase.startBar.index);
        const endBar = quantizedMap.get(before.phrase.endBar.index);

        bar.phrase = new QuantizedPhrase(
          before.phrase.phrase,
          startBar,
          endBar
        );
      }

      if (before.segments.length > 0) {
        const segment = before.segments[0];
        const startBar = quantizedMap.get(segment.startBar.index);
        const endBar = quantizedMap.get(segment.endBar.index);

        bar.segment = new QuantizedSegment(
          segment.current,
          segment.parent,
          startBar,
          endBar,
          segment.isSabi
        );
      }
    });

    this._map = new Map();
    quantizedBars.forEach((it) => this._map.set(it.firstBeat.index, it));
  }

  public find(index: number) {
    return this._map ? this._map.get(index) : null;
  }
}
