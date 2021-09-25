import { IBeat, IPhrase, IRepetitiveSegments } from "textalive-app-api";
import ParsingBar from "./ParsingBar";
import Quantizer from "./Quantizer";
import QuantizedBar from "./QuantizedBar";
import PartParser from "./PartParser";
import Part from "./Part";
import QuantizedSegment from "./QuantizedSegment";
import QuantizedPhrase from "./QuantizedPhrase";

export default class QuantizedSong {
  protected _beats: IBeat[];
  protected _rawPhrases: IPhrase[];
  protected _rawSegments: IRepetitiveSegments[];
  protected _bars: QuantizedBar[] = [];

  get bars(): QuantizedBar[] {
    return this._bars;
  }

  get phrases(): QuantizedPhrase[] {
    return this.bars
      ? this.bars.map((it) => it.phrase).filter((it) => !!it)
      : [];
  }

  get segments(): QuantizedSegment[] {
    return this.bars
      ? this.bars.map((it) => it.segment).filter((it) => !!it)
      : [];
  }

  get parts(): Part[] {
    return this.bars ? this.bars.map((it) => it.part).filter((it) => !!it) : [];
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
    this._bars = Quantizer.refill(bars);
    PartParser.parseParts(this.bars, this.phrases, this.segments);
  }

  findBar(position: number) {
    return this.bars.filter(
      (it) =>
        it.startBeat.startTime < position &&
        (!it.next || position < it.next.startTime)
    )[0];
  }
}
