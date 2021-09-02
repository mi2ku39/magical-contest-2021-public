import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { IPlayerApp, ISongMap, IVideo, IWord, Player } from "textalive-app-api";
import styles from "@/pages/index.module.scss";
import ControllerButton from "~/components/ControllerButton";
import VolumeControllerButton from "~/components/VolumeControllerButton";

const index: React.FC = () => {
  const [token] = useState<string>(process.env.NEXT_PUBLIC_TEXTALIVE_APP_TOKEN);
  const [fallbackSongUrl] = useState<string>(
    process.env.NEXT_PUBLIC_FALLBACK_SONG_URL
  );
  const [player, setPlayer] = useState<Player | null>(null);
  const [isPlaying, setPlayState] = useState(false);
  const [isInitialMute, setInitialMuteState] = useState(false);
  const [initialVolume, setInitialVolume] = useState(50);
  const mediaElement = useRef<HTMLDivElement>();

  const [lyric, setLyric] = useState("");
  const animate = useCallback(
    (now: number, unit: IWord) => {
      if (!unit.contains(now)) return;
      setLyric((prev) => {
        console.log(prev);
        return `${unit.text}`;
      });
    },
    [setLyric]
  );

  const onAppReady = useCallback<(app: IPlayerApp) => void>(
    (app) => {
      if (!app.songUrl) {
        player.createFromSongUrl(fallbackSongUrl);
      }
    },
    [player]
  );

  const onSongMapLoad = useCallback<
    (songMap?: ISongMap, reason?: Error) => void
  >((songMap, reason) => {
    console.dir(songMap);
  }, []);

  const onVideoReady = useCallback<(v?: IVideo) => void>(
    (v) => {
      if (!(player && v)) return;

      let word = player.video.firstWord;
      while (word) {
        word.animate = animate;
        word = word.next;
      }
    },
    [player, animate]
  );

  const onPlay = useCallback(() => setPlayState(true), [setPlayState]);
  const onPause = useCallback(() => setPlayState(false), [setPlayState]);

  useEffect(() => {
    if (!player) {
      setPlayer(
        new Player({
          app: {
            token,
          },
          mediaElement: mediaElement.current,
        })
      );
    } else {
      player.addListener({
        onAppReady,
        onSongMapLoad,
        onVideoReady,
        onPlay,
        onPause,
      });

      const v = parseInt(localStorage.getItem("volume"));
      const bv = parseInt(localStorage.getItem("beforeMuteVolume"));
      const isMute = localStorage.getItem("mute") === "true";
      setInitialVolume(isNaN(v) ? 50 : v);
      setInitialMuteState(isMute);

      player.volume = isMute ? 0 : v;
    }
  }, [token, player]);

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

  return (
    <>
      <div>{lyric}</div>

      <div className={styles.media}>
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
              />
            ) : (
              <ControllerButton
                src="/images/icons/play.svg"
                balloonText="再生"
                onClick={onClickPlayerToggleButton}
              />
            )}
          </div>
          <div>
            <VolumeControllerButton
              onChangingVolume={onChangingVolume}
              onChangedVolume={onChangedVolume}
              onMute={onMute}
              onUnmute={onUnmute}
              initialMuteState={isInitialMute}
              initialVolume={initialVolume}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default index;
