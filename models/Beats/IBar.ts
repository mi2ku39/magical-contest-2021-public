import { IBeat } from "textalive-app-api";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

export default interface IBar {
  phrase?: QuantizedPhrase;
  segment?: QuantizedSegment;
  index: number;
  firstBeat: IBeat;
  startTime: number;
  bars: IBeat[];
  length: number;
}
