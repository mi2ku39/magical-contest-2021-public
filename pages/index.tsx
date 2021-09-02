import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IPlayerApp, ISongMap, IVideo, Player } from "textalive-app-api";
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
  const mediaElement = useRef<HTMLDivElement>();
  const mediaBannerElement = useRef<HTMLDivElement>();

  const animate = useCallback(() => {}, []);

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

  const onVideoReady = useCallback<(v?: IVideo) => void>((v) => {
    if (!v) return;
    console.dir(v.firstWord);
  }, []);

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
    }
  }, [
    token,
    player,
    mediaElement,
    mediaBannerElement,
    onAppReady,
    onSongMapLoad,
    onVideoReady,
    onPlay,
    onPause,
  ]);

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

  return (
    <>
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
            <VolumeControllerButton />
          </div>
        </div>
      </div>
    </>
  );
};
export default index;
