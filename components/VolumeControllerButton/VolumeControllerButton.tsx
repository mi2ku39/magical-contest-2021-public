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
import Icon from "~/constants/Icon";
import ControllerButton from "../ControllerButton";
import styles from "./VolumeControllerButton.module.scss";

type Props = {
  onChangingVolume?: (volume: number) => void;
  onChangedVolume?: (volume: number) => void;
  onMute?: (volume: number) => void;
  onUnmute?: () => number;
  initialVolume?: number;
  initialMuteState?: boolean;
};

const VolumeControllerButton: React.FC<Props> = ({
  onChangingVolume,
  onChangedVolume,
  onMute,
  onUnmute,
  initialVolume,
  initialMuteState,
}) => {
  const [isVisibleFader, setFaderVisibility] = useState(false);
  const [isMute, setMuteState] = useState(false);
  const [volume, setVolume] = useState<number>(50);
  const fader = useRef<HTMLInputElement>();

  const onMouseEnterButton = useCallback(() => {
    setFaderVisibility(true);
  }, []);

  const onMouseLeaveButton = useCallback(() => {
    setFaderVisibility(false);
  }, []);

  const onMouseEnterFader = useCallback<
    MouseEventHandler<HTMLDivElement>
  >(() => {
    setFaderVisibility(true);
  }, []);

  const onMouseLeaveFader = useCallback<
    MouseEventHandler<HTMLDivElement>
  >(() => {
    setFaderVisibility(false);
  }, []);

  const onFaderValueChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (isMute) {
        setMuteState(false);
        onUnmute();
      }
      const volume = isNaN(parseInt(e.target.value))
        ? 50
        : parseInt(e.target.value);
      setVolume(volume);
      if (onChangingVolume) onChangingVolume(volume);
    },
    [isMute, onChangingVolume, onUnmute]
  );

  const onFaderMouseButtonUp = useCallback<MouseEventHandler<HTMLInputElement>>(
    (e) => {
      if (onChangedVolume) onChangedVolume(volume);
    },
    [volume, onChangedVolume]
  );

  const onButtonClick = useCallback(() => {
    if (isMute) {
      setMuteState(false);
      const beforeMuteVolume = onUnmute ? onUnmute() : 50;
      setVolume(beforeMuteVolume);
      fader.current.value = beforeMuteVolume.toString();
    } else {
      setMuteState(true);
      setVolume(0);
      fader.current.value = "0";
      if (onMute) onMute(volume);
    }
  }, [volume, isMute, onMute, onUnmute]);

  const volumeIcon = useMemo<string>(() => {
    if (isMute) {
      return Icon.volumeOff;
    }

    if (volume <= 0) {
      return Icon.volumeMinimum;
    } else if (volume >= 1 && volume < 50) {
      return Icon.volumeDown;
    } else {
      return Icon.volumeUp;
    }
  }, [volume, isMute]);

  useEffect(() => {
    if (fader) {
      if (initialMuteState) {
        setMuteState(initialMuteState);
        fader.current.value = "0";
      } else if (initialVolume) {
        setVolume(initialVolume);
        fader.current.value = initialVolume.toString();
      }
    }
  }, [fader, initialMuteState, initialVolume]);

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
          ref={fader}
          onChange={onFaderValueChange}
          onMouseUp={onFaderMouseButtonUp}
        />
      </div>
      <ControllerButton
        src={volumeIcon}
        onClick={onButtonClick}
        onMouseEnter={onMouseEnterButton}
        onMouseLeave={onMouseLeaveButton}
        balloonText={isMute ? "ミュート解除" : "ミュートする"}
      />
    </div>
  );
};
export default VolumeControllerButton;
