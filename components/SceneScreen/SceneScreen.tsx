import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IBeat, Song } from "textalive-app-api";
import Icon from "~/constants/Icon";
import Illustration from "~/constants/Illustration";
import Part, { PartTypes } from "~/models/Beats/Part";
import QuantizedBar from "~/models/Beats/QuantizedBar";
import QuantizedPhrase from "~/models/Beats/QuantizedPhrase";
import DummyImage from "../DummyImage";
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
import SceneJ from "./Scene/SceneJ";
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
  isParentMounted: boolean;
  isShowedArrowHint: boolean;
  isShowedSpacebarHint: boolean;
  isShowedDragHint: boolean;
  pushShowedHint: (hint: Hint) => void;
  noteCount: number;
  addNoteCount: (num?: number) => void;
  setRenderOnDragStartListeners: React.Dispatch<
    React.SetStateAction<((e: SceneDragEvent) => void)[]>
  >;
  setRenderOnDragMoveListeners: React.Dispatch<
    React.SetStateAction<((e: SceneDragEvent) => void)[]>
  >;
  setRenderOnDragEndListeners: React.Dispatch<
    React.SetStateAction<((e: SceneDragEvent) => void)[]>
  >;
} & SceneRenderProps;

export const Inputs = {
  arrowUp: "ArrowUp",
  arrowLeft: "ArrowLeft",
  arrowRight: "ArrowRight",
  arrowDown: "ArrowDown",
  space: "Space",
};

export type SceneDragEvent = {
  initial: {
    clientX: number;
    clientY: number;
  };
  diff: {
    clientX: number;
    clientY: number;
  };
  clientX: number;
  clientY: number;
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
      return <SceneJ {...props} />;

    default:
      return <DefaultScene {...props} />;
  }
};

export const Hints = {
  arrowHint: 1,
  spacebarHint: 2,
  dragHint: 3,
};
export type Hint = typeof Hints[keyof typeof Hints];

const SceneScreen: React.FC<SceneRenderProps> = (props) => {
  const [isMounted, setMountState] = useState<boolean>(false);
  const [showedHints, setShowedHints] = useState<Hint[]>([]);
  const [noteCount, setNoteCount] = useState<number>(0);
  const [dragInitial2D, setDragInitial2D] =
    useState<{ x: number; y: number }>(null);
  const [renderOnDragStartListeners, setRenderOnDragStartListeners] = useState<
    ((e: SceneDragEvent) => void)[]
  >([]);
  const [renderOnDragMoveListeners, setRenderOnDragMoveListeners] = useState<
    ((e: SceneDragEvent) => void)[]
  >([]);
  const [renderOnDragEndListeners, setRenderOnDragEndListeners] = useState<
    ((e: SceneDragEvent) => void)[]
  >([]);
  const [isMouseDowning, setMouseDownState] = useState<boolean>(false);

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

  const isShowedDragHint = useMemo<boolean>(
    () => showedHints.includes(Hints.dragHint),
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

  const makeSceneDragEventObject = useCallback<
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => SceneDragEvent
  >(
    (e) => {
      return {
        initial: {
          clientX: dragInitial2D?.x,
          clientY: dragInitial2D?.y,
        },
        diff: {
          clientX: e.clientX - (dragInitial2D?.x ?? 0),
          clientY: e.clientY - (dragInitial2D?.y ?? 0),
        },
        clientX: e.clientX,
        clientY: e.clientY,
      };
    },
    [dragInitial2D]
  );

  const onRenderDragStart = useCallback(
    (e: SceneDragEvent) => {
      renderOnDragStartListeners.forEach((it) => {
        if (it) it(e);
      });
    },
    [renderOnDragStartListeners]
  );
  const onRenderDragMove = useCallback(
    (e: SceneDragEvent) => {
      renderOnDragMoveListeners.forEach((it) => {
        if (it) it(e);
      });
    },
    [renderOnDragMoveListeners]
  );
  const onRenderDragEnd = useCallback(
    (e: SceneDragEvent) => {
      renderOnDragEndListeners.forEach((it) => {
        if (it) it(e);
      });
    },
    [renderOnDragEndListeners]
  );

  const onMouseDown = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (event.button === 0) {
        setDragInitial2D((prev) => {
          if (prev === null) {
            return { x: event.clientX, y: event.clientY };
          }
          return prev;
        });
        setMouseDownState(true);
        onRenderDragStart(makeSceneDragEventObject(event));
        event.preventDefault();
      }
    },
    [onRenderDragStart, makeSceneDragEventObject]
  );

  const onMouseMove = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (isMouseDowning) {
        onRenderDragMove(makeSceneDragEventObject(event));
        event.preventDefault();
      }
    },
    [isMouseDowning, onRenderDragMove, makeSceneDragEventObject]
  );

  const onMouseUp = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      if (event.button === 0) {
        setDragInitial2D(null);
        setMouseDownState(false);
        onRenderDragEnd(makeSceneDragEventObject(event));
        event.preventDefault();
      }
    },
    [onRenderDragEnd, makeSceneDragEventObject]
  );

  useEffect(() => {
    if (props.isReset) {
      setShowedHints([]);
      setNoteCount(0);
    }

    if (window) {
      window.addEventListener("keydown", onKeydown);
      window.addEventListener("keyup", onKeyup);
    }

    setMountState(true);

    return () => {
      setMountState(false);

      if (window) {
        window.removeEventListener("keydown", onKeydown);
        window.removeEventListener("keyup", onKeyup);
      }
    };
  }, [props.isReset, onKeydown, onKeyup]);

  return (
    <div
      className={styles.container}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className={styles.topWakuContainer}>
        <div>
          <div>
            <img src={Illustration.waku.top} />
          </div>
        </div>
      </div>
      <SceneRender
        {...props}
        pushShowedHint={pushShowedHint}
        isShowedArrowHint={isShowedArrowHint}
        isShowedSpacebarHint={isShowedSpacebarHint}
        isShowedDragHint={isShowedDragHint}
        isParentMounted={isMounted}
        noteCount={noteCount}
        addNoteCount={addNoteCount}
        setRenderOnDragStartListeners={setRenderOnDragStartListeners}
        setRenderOnDragMoveListeners={setRenderOnDragMoveListeners}
        setRenderOnDragEndListeners={setRenderOnDragEndListeners}
      />
      <div className={styles.bottomWakuContainer}>
        <div>
          <div>
            <img src={Illustration.waku.bottom} />
          </div>
        </div>
      </div>
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
