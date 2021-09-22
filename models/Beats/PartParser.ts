import Part, { PartTypes } from "./Part";
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

const getRandomInt = (max) => Math.floor(Math.random() * max);

const assignPartType = (parts: Part[]) => {
  let sabiCount: number = 0;
  parts.forEach((it) => {
    if (!it.previous) {
      it.partType = PartTypes.A;
      return;
    }

    if (!it.next) {
      it.partType = PartTypes.J;
      return;
    }

    if (it.previous?.partType === PartTypes.A && it.hasPhrase) {
      it.partType = PartTypes.B;
      return;
    }

    if (it.next.isSabi && sabiCount === 0) {
      it.partType = PartTypes.C;
      return;
    }

    if (it.isSabi && sabiCount === 0) {
      it.partType = PartTypes.D;
      sabiCount++;
      return;
    }

    if (it.previous?.isSabi && !it.hasPhrase && sabiCount === 1) {
      it.partType = PartTypes.D;
      return;
    }

    if (
      it.next.isSabi &&
      it.next?.next.isSabi &&
      it.next?.next?.next.isSabi &&
      it.hasPhrase
    ) {
      it.partType = PartTypes.G;
      return;
    }

    if (it.next?.isSabi && it.next?.next?.isSabi && it.hasPhrase) {
      it.partType = PartTypes.H;
      return;
    }

    if (sabiCount >= 1 && it.hasPhrase && it.isSabi) {
      sabiCount++;
      it.partType = PartTypes.I;
      return;
    }

    if (sabiCount >= 2 && it.previous?.isSabi && !it.hasPhrase) {
      it.partType = PartTypes.I;
      return;
    }

    if (!it.next?.hasPhrase && !it.isSabi) {
      it.partType = PartTypes.E;
      return;
    }

    if (!it.hasPhrase && !it.previous?.isSabi) {
      it.partType = PartTypes.F;
      return;
    }

    switch (getRandomInt(3)) {
      case 0:
        it.partType = PartTypes.B;
        break;
      case 1:
        it.partType = PartTypes.C;
        break;
      case 2:
      default:
        it.partType = PartTypes.E;
    }
  });
  return parts;
};

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
    if (bar.index < skips || bars.indexOf(bar) === bars.length - 1) return;

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
      (nextPhrase && nextPhrase.startBar.index < nextSegment.startBar.index)
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
  assignPartType(parts);
  return parts;
};

export default {
  parseParts,
};
