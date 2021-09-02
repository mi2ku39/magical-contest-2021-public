import clsx from "clsx";
import {
  ChangeEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ControllerButton from "../ControllerButton";
import styles from "./VolumeControllerButton.module.scss";

type Props = {};

const VolumeControllerButton: React.FC<Props> = ({}) => {
  const [isEnterCursorOnFader, setCursorOnFaderState] = useState(false);
  const [isDraggingFader, setFaderDraggingState] = useState(false);
  const [isVisibleFader, setFaderVisibility] = useState(false);
  const fader = useRef<HTMLInputElement>();
  const [volume, setVolume] = useState(0);

  const onDocumentMouseDown = useCallback(() => {
    if (!isEnterCursorOnFader) return;
    setFaderDraggingState(true);
  }, [isEnterCursorOnFader, setFaderDraggingState]);

  const onDocumentMouseUp = useCallback(() => {
    if (!isDraggingFader) return;
    setFaderDraggingState(false);
    if (!isEnterCursorOnFader) setFaderVisibility(false);
  }, [
    isEnterCursorOnFader,
    isDraggingFader,
    setFaderDraggingState,
    setFaderVisibility,
  ]);

  const onMouseEnterButton = useCallback(() => {
    setFaderVisibility(true);
  }, [setFaderVisibility]);

  const onMouseLeaveButton = useCallback(() => {
    if (isDraggingFader) return;
    setFaderVisibility(false);
  }, [setFaderVisibility, isDraggingFader]);

  const onMouseEnterFader = useCallback<
    MouseEventHandler<HTMLDivElement>
  >(() => {
    setCursorOnFaderState(true);
    setFaderVisibility(true);
  }, [setCursorOnFaderState, setFaderVisibility]);

  const onMouseLeaveFader = useCallback<
    MouseEventHandler<HTMLDivElement>
  >(() => {
    setCursorOnFaderState(false);
    if (isDraggingFader) return;
    setFaderVisibility(false);
  }, [setCursorOnFaderState, setFaderVisibility, isDraggingFader]);

  const onFaderValueChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setVolume(parseInt(e.target.value));
    },
    [setVolume]
  );

  const onButtonClick = useCallback(() => {
    setVolume(0);
    fader.current.value = "0";
  }, [setVolume]);

  const volumeIcon = useMemo<string>(() => {
    if (volume <= 0) {
      return "/images/icons/volume_mute.svg";
    } else if (volume >= 1 && volume < 50) {
      return "/images/icons/volume_down.svg";
    } else {
      return "/images/icons/volume_up.svg";
    }
  }, [volume]);

  useEffect(() => {
    document.addEventListener("mousedown", onDocumentMouseDown);
    document.addEventListener("mouseup", onDocumentMouseUp);
    return () => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
      document.removeEventListener("mouseup", onDocumentMouseUp);
    };
  }, [onDocumentMouseDown, onDocumentMouseUp]);

  return (
    <div className={styles.container}>
      <div
        className={clsx(
          styles.faderContainer,
          isVisibleFader && styles.faderVisible
        )}
        onMouseEnter={onMouseEnterFader}
        onMouseLeave={onMouseLeaveFader}
      >
        <input
          type="range"
          orient="vertical"
          ref={fader}
          onChange={onFaderValueChange}
        />
      </div>
      <ControllerButton
        src={volumeIcon}
        onClick={onButtonClick}
        onMouseEnter={onMouseEnterButton}
        onMouseLeave={onMouseLeaveButton}
      />
    </div>
  );
};
export default VolumeControllerButton;
