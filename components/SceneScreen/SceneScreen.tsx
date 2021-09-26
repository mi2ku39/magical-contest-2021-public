import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IBeat, Song } from "textalive-app-api";
import Icon from "~/constants/Icon";
import Part, { PartTypes } from "~/models/Beats/Part";
import QuantizedBar from "~/models/Beats/QuantizedBar";
import QuantizedPhrase from "~/models/Beats/QuantizedPhrase";
import DefaultScene from "./Scene/DefaultScene";
import SceneA from "./Scene/SceneA";
import SceneB from "./Scene/SceneB";
import SceneC from "./Scene/SceneC";
import SceneD from "./Scene/SceneD";
import SceneE from "./Scene/SceneE";
import SceneF from "./Scene/SceneF";
import SceneG from "./Scene/SceneG";
import SceneH from "./Scene/SceneH";
import SceneI from "./Scene/SceneI";
import styles from "./SceneScreen.module.scss";

export type SceneRenderProps = {
  position?: number;
  beat?: IBeat;
  bar?: QuantizedBar;
  part?: Part;
  phrase?: QuantizedPhrase;
  song?: Song;
  requestPlay?: () => boolean;
  isPlayable?: boolean;
  isPlaying: boolean;
  isReset: boolean;
};

export type SceneProps = {
  isShowedArrowHint: boolean;
  isShowedSpacebarHint: boolean;
  pushShowedHint: (hint: Hint) => void;
  noteCount: number;
  addNoteCount: (num?: number) => void;
} & SceneRenderProps;

export const Inputs = {
  arrowUp: "ArrowUp",
  arrowLeft: "ArrowLeft",
  arrowRight: "ArrowRight",
  arrowDown: "ArrowDown",
  space: "Space",
};

const SceneRender: React.FC<SceneProps> = (props) => {
  const partType = useMemo(() => props.part?.partType ?? null, [props.part]);
  switch (partType) {
    case PartTypes.A:
      return <SceneA {...props} />;

    case PartTypes.B:
      return <SceneB {...props} />;

    case PartTypes.C:
      return <SceneC {...props} />;

    case PartTypes.D:
      return <SceneD {...props} />;

    case PartTypes.E:
      return <SceneE {...props} />;

    case PartTypes.F:
      return <SceneF {...props} />;

    case PartTypes.G:
      return <SceneG {...props} />;

    case PartTypes.H:
      return <SceneH {...props} />;

    case PartTypes.I:
      return <SceneI {...props} />;

    case PartTypes.J:
      return <SceneI {...props} />;

    default:
      return <DefaultScene {...props} />;
  }
};

export const Hints = {
  arrowHint: 1,
  spacebarHint: 2,
};
export type Hint = typeof Hints[keyof typeof Hints];

const SceneScreen: React.FC<SceneRenderProps> = (props) => {
  const [showedHints, setShowedHints] = useState<Hint[]>([]);
  const [noteCount, setNoteCount] = useState<number>(0);

  const pushShowedHint = useCallback<(hint: Hint) => void>((hint) => {
    setShowedHints((prev) => {
      if (!prev.includes(hint)) {
        return [...prev, hint];
      }
      return prev;
    });
  }, []);

  const addNoteCount = useCallback<(num?: number) => void>(
    (num = 1) => setNoteCount((prev) => prev + num),
    []
  );

  const isShowedArrowHint = useMemo<boolean>(
    () => showedHints.includes(Hints.arrowHint),
    [showedHints]
  );

  const isShowedSpacebarHint = useMemo<boolean>(
    () => showedHints.includes(Hints.spacebarHint),
    [showedHints]
  );

  const onKeydown = useCallback((event: KeyboardEvent) => {
    if (
      event.code === Inputs.arrowUp ||
      event.code === Inputs.arrowLeft ||
      event.code === Inputs.arrowRight ||
      event.code === Inputs.arrowDown ||
      event.code === Inputs.space
    ) {
      event.preventDefault();
    }
  }, []);

  const onKeyup = useCallback((event: KeyboardEvent) => {
    if (
      event.code === Inputs.arrowUp ||
      event.code === Inputs.arrowLeft ||
      event.code === Inputs.arrowRight ||
      event.code === Inputs.arrowDown ||
      event.code === Inputs.space
    ) {
      event.preventDefault();
    }
  }, []);

  useEffect(() => {
    if (props.isReset) {
      setShowedHints([]);
      setNoteCount(0);
    }
  }, [props.isReset]);

  useEffect(() => {
    if (window) {
      window.addEventListener("keydown", onKeydown);
      window.addEventListener("keyup", onKeyup);
    }

    return () => {
      if (window) {
        window.removeEventListener("keydown", onKeydown);
        window.removeEventListener("keyup", onKeyup);
      }
    };
  }, [onKeydown, onKeyup]);

  return (
    <div className={styles.container}>
      <SceneRender
        {...props}
        pushShowedHint={pushShowedHint}
        isShowedArrowHint={isShowedArrowHint}
        isShowedSpacebarHint={isShowedSpacebarHint}
        noteCount={noteCount}
        addNoteCount={addNoteCount}
      />
      {noteCount > 0 && (
        <div className={styles.musicNoteCounterContainer}>
          <img className={styles.big} src={Icon.musicNoteWH} />
          <img src={Icon.closeWH} />
          <span>{noteCount}</span>
        </div>
      )}
    </div>
  );
};
export default SceneScreen;
