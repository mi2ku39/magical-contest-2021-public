import React, {
  MouseEventHandler,
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import { IPlayerApp, ISongMap, IVideo, IWord, Player } from "textalive-app-api";
import styles from "@/pages/index.module.scss";
import MediaController from "~/components/MediaController";

const index: React.FC = () => {
  const [token] = useState<string>(process.env.NEXT_PUBLIC_TEXTALIVE_APP_TOKEN);
  const [fallbackSongUrl] = useState<string>(
    process.env.NEXT_PUBLIC_FALLBACK_SONG_URL
  );
  const [player, setPlayer] = useState<Player | null>(null);
  const [isPlaying, setPlayState] = useState(false);
  const [isInitialMute, setInitialMuteState] = useState(false);
  const [initialVolume, setInitialVolume] = useState(50);
  const [mediaElement, setMediaElement] =
    useState<MutableRefObject<HTMLDivElement>>(null);

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
    if (!mediaElement) return;

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
      const isMute = localStorage.getItem("mute") === "true";
      setInitialVolume(isNaN(v) ? 50 : v);
      setInitialMuteState(isMute);

      player.volume = isMute ? 0 : v;
    }
  }, [token, player, mediaElement]);

  return (
    <>
      <div>{lyric}</div>

      <div className={styles.media}>
        <MediaController
          player={player}
          onUpdateMediaDom={setMediaElement}
          initialMuteState={isInitialMute}
          initialVolume={initialVolume}
          isPlaying={isPlaying}
        />
      </div>
    </>
  );
};
export default index;
