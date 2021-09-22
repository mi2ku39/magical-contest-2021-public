import React, {
  MouseEventHandler,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Player } from "textalive-app-api";
import Icon from "~/constants/Icon";
import ControllerButton from "../ControllerButton";
import MediaModalDialog from "../MediaModalDialog";
import VolumeControllerButton from "../VolumeControllerButton";
import styles from "./MediaController.module.scss";

type Props = {
  onUpdateMediaDom?: (ref: MutableRefObject<HTMLDivElement>) => void;
  onRequestedStop?: () => void;
  initialMuteState?: boolean;
  initialVolume?: number;
  isPlaying: boolean;
  player: Player;
  isEnablePlayButton?: boolean;
  onClickInfo?: () => void;
};

const MediaController: React.FC<Props> = ({
  player,
  onUpdateMediaDom,
  initialMuteState,
  initialVolume,
  isPlaying,
  isEnablePlayButton = true,
  onRequestedStop,
  onClickInfo,
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

    if (player.requestStop()) {
      if (onRequestedStop) onRequestedStop();
    }
  }, [player, onRequestedStop]);

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
            src={Icon.replay}
            balloonText="最初に戻す"
            onClick={onClickPlayerStopButton}
          />
        </div>
        <div>
          {isPlaying ? (
            <ControllerButton
              src={Icon.pause}
              balloonText="一時停止"
              onClick={onClickPlayerToggleButton}
              enabled={isEnablePlayButton}
            />
          ) : (
            <ControllerButton
              src={Icon.play}
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
        <div className={styles.alignEnd}>
          <div>
            <ControllerButton
              src={Icon.mediaChange}
              balloonText="楽曲を変える"
              left
              enabled={isEnablePlayButton}
              onClick={onClickInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default MediaController;
