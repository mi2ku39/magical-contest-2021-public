import React, {
  MouseEventHandler,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Player } from "textalive-app-api";
import ControllerButton from "../ControllerButton";
import VolumeControllerButton from "../VolumeControllerButton";
import styles from "./MediaController.module.scss";

type Props = {
  onUpdateMediaDom?: (ref: MutableRefObject<HTMLDivElement>) => void;
  onClickPlayerStopButton?: MouseEventHandler<HTMLDivElement>;
  onClickPlayerToggleButton?: MouseEventHandler<HTMLDivElement>;
  onChangingVolume?: (volume: number) => void;
  onChangedVolume?: (volume: number) => void;
  onMute?: (volumeBeforeMute: number) => void;
  onUnmute?: () => number;
  initialMuteState?: boolean;
  initialVolume?: number;
  isPlaying: boolean;
  player: Player;
  isEnablePlayButton?: boolean;
};

const MediaController: React.FC<Props> = ({
  player,
  onUpdateMediaDom,
  initialMuteState,
  initialVolume,
  isPlaying,
  isEnablePlayButton = true,
}) => {
  const mediaElement = useRef<HTMLDivElement>();

  const onClickPlayerToggleButton = useCallback<
    MouseEventHandler<HTMLDivElement>
  >(() => {
    if (!player) return;

    if (player.isPlaying) {
      player.requestPause();
    } else {
      player.requestPlay();
    }
  }, [player]);

  const onClickPlayerStopButton = useCallback<
    MouseEventHandler<HTMLDivElement>
  >(() => {
    if (!player) return;

    player.requestStop();
  }, [player]);

  const onChangingVolume = useCallback(
    (volume: number) => {
      if (!player) return;
      player.volume = volume;
    },
    [player]
  );
  const onChangedVolume = useCallback(
    (volume: number) => {
      if (!player) return;
      player.volume = volume;
      localStorage.setItem("volume", volume.toString());
    },
    [player]
  );
  const onMute = useCallback(
    (volume: number) => {
      if (!player) return;
      localStorage.setItem("beforeMuteVolume", volume.toString());
      localStorage.setItem("mute", "true");
      player.volume = 0;
    },
    [player]
  );
  const onUnmute = useCallback<() => number>(() => {
    if (!player) return;
    const volume = parseInt(localStorage.getItem("beforeMuteVolume"));
    localStorage.setItem("mute", "false");
    player.volume = isNaN(volume) ? 50 : volume;
    return isNaN(volume) ? 50 : volume;
  }, [player]);

  useEffect(() => {
    if (onUpdateMediaDom) onUpdateMediaDom(mediaElement);
  }, [mediaElement, onUpdateMediaDom]);

  return (
    <div className={styles.container}>
      <div ref={mediaElement}></div>
      <div className={styles.controllerContainer}>
        <div>
          <ControllerButton
            src="/images/icons/replay.svg"
            balloonText="最初に戻す"
            onClick={onClickPlayerStopButton}
          />
        </div>
        <div>
          {isPlaying ? (
            <ControllerButton
              src="/images/icons/pause.svg"
              balloonText="一時停止"
              onClick={onClickPlayerToggleButton}
              enabled={isEnablePlayButton}
            />
          ) : (
            <ControllerButton
              src="/images/icons/play.svg"
              balloonText="再生"
              onClick={onClickPlayerToggleButton}
              enabled={isEnablePlayButton}
            />
          )}
        </div>
        <div>
          <VolumeControllerButton
            onChangingVolume={onChangingVolume}
            onChangedVolume={onChangedVolume}
            onMute={onMute}
            onUnmute={onUnmute}
            initialMuteState={initialMuteState}
            initialVolume={initialVolume}
          />
        </div>
      </div>
    </div>
  );
};
export default MediaController;
