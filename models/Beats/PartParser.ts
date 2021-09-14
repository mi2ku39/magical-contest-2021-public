import Part from "./Part";
import QuantizedBar from "./QuantizedBar";
import QuantizedPhrase from "./QuantizedPhrase";
import QuantizedSegment from "./QuantizedSegment";

const searchPhraseBreakBar = (index: number, phrases: QuantizedPhrase[]) => {
  const search = phrases.filter((it) => it.startBar.index >= index);
  let breakBar: QuantizedPhrase = null;
  for (let it of search) {
    breakBar = it;
    if (!it.endBar.phrase || it.endBar.segment) {
      break;
    }
  }
  return breakBar.endBar;
};

const searchNextPhrase = (index: number, phrases: QuantizedPhrase[]) => {
  return phrases.filter((it) => it.startBar.index >= index)[0] ?? null;
};

const searchNextSegment = (index: number, segments: QuantizedSegment[]) => {
  return segments.filter((it) => it.startBar.index >= index)[0] ?? null;
};

const containsPhrase = (index: number, phrases: QuantizedPhrase[]) =>
  phrases
    .map((it) => it.startBar.index < index && index < it.endBar.index)
    .includes(true);

const parseParts = (
  bars: QuantizedBar[],
  phrases: QuantizedPhrase[],
  segments: QuantizedSegment[]
) => {
  let skips: number = 0;
  const parts: Part[] = [];
  let partIndex = 1;
  let prevPart: Part = null;

  bars.forEach((bar) => {
    if (bar.index < skips) return;

    console.log(bar.index);

    if (bar.index === 1) {
      if (bar.segment) {
        const newPart = new Part(
          partIndex++,
          bar.segment.startBar,
          bar.segment.endBar,
          bar.segment.isSabi,
          !!bar.phrase
        );
        bar.part = newPart;
        skips = bar.segment.endBar.index;
        prevPart = newPart;
        parts.push(newPart);
        return;
      }

      if (bar.phrase) {
        const endBar = searchPhraseBreakBar(bar.index, phrases);
        const newPart = new Part(partIndex++, bar, endBar, false, true);
        bar.part = newPart;
        skips = endBar.index;
        prevPart = newPart;
        parts.push(newPart);
        return;
      }

      const nextSegment = searchNextSegment(bar.index, segments);
      const nextPhrase = searchNextPhrase(bar.index, phrases);

      if (nextPhrase.startBar.index < nextSegment.startBar.index) {
        const newPart = new Part(partIndex++, bar, nextPhrase.startBar);
        bar.part = newPart;
        skips = nextPhrase.startBar.index;
        prevPart = newPart;
        parts.push(newPart);
        return;
      } else {
        const newPart = new Part(partIndex++, bar, nextSegment.startBar);
        bar.part = newPart;
        skips = nextSegment.startBar.index;
        prevPart = newPart;
        parts.push(newPart);
        return;
      }
    }

    if (bar.segment) {
      const newPart = new Part(
        partIndex++,
        bar.segment.startBar,
        bar.segment.endBar,
        bar.segment.isSabi,
        !!bar.phrase
      );
      prevPart.next = newPart;
      newPart.previous = prevPart;
      bar.part = newPart;
      skips = bar.segment.endBar.index;
      prevPart = newPart;
      parts.push(newPart);
      return;
    }

    if (bar.phrase) {
      const endBar = searchPhraseBreakBar(bar.index, phrases);
      const newPart = new Part(partIndex++, bar, endBar, false, true);
      prevPart.next = newPart;
      newPart.previous = prevPart;
      bar.part = newPart;
      skips = endBar.index;
      prevPart = newPart;
      parts.push(newPart);
      return;
    }

    const isContainPhrase = containsPhrase(bar.index, phrases);
    const nextSegment = searchNextSegment(bar.index, segments);
    const nextPhrase = searchNextPhrase(bar.index, phrases);

    if (!(nextSegment || nextPhrase || isContainPhrase)) {
      const lastBar = bars.slice(-1)[0];
      const newPart = new Part(partIndex++, bar, lastBar);
      prevPart.next = newPart;
      newPart.previous = prevPart;
      bar.part = newPart;
      skips = lastBar.index;
      prevPart = newPart;
      parts.push(newPart);
      return;
    } else if (
      isContainPhrase ||
      nextPhrase.startBar.index < nextSegment.startBar.index
    ) {
      const newPart = new Part(partIndex++, bar, nextPhrase.startBar);
      prevPart.next = newPart;
      newPart.previous = prevPart;
      bar.part = newPart;
      skips = nextPhrase.startBar.index;
      prevPart = newPart;
      parts.push(newPart);
      return;
    } else if (nextSegment) {
      const newPart = new Part(partIndex++, bar, nextSegment.startBar);
      prevPart.next = newPart;
      newPart.previous = prevPart;
      bar.part = newPart;
      skips = nextSegment.startBar.index;
      prevPart = newPart;
      parts.push(newPart);
      return;
    }
  });

  console.dir(parts);

  return parts;
};

export default {
  parseParts,
};
