import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  IBeat,
  IChord,
  IPlayerApp,
  IRepetitiveSegments,
  IVideo,
  Player,
  SongleTimer,
} from "textalive-app-api";
import styles from "@/pages/index.module.scss";
import MediaController from "~/components/MediaController";
import QuantizedSong from "~/models/Beats/QuantizedSong";
import QuantizedPhrase from "~/models/Beats/QuantizedPhrase";
import Part from "~/models/Beats/Part";
import QuantizedBar from "~/models/Beats/QuantizedBar";
import SceneScreen from "~/components/SceneScreen";
import ModalDialog from "~/components/ModalDialog";
import ControllerButton from "~/components/ControllerButton";
import Icon from "~/constants/Icon";
import InformationModalDialog from "~/components/InformationModalDialog";

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
  const [isEnablePlayButton, setPlayButtonEnabled] = useState(false);

  const [quantizedSong, setQuantizedSong] = useState<QuantizedSong>();
  const [position, setPosition] = useState<number>();
  const [beat, setBeat] = useState<IBeat>();
  const [bar, setBar] = useState<QuantizedBar>();
  const [part, setPart] = useState<Part>();
  const [phrase, setPhrase] = useState<QuantizedPhrase>();

  const onAppReady = useCallback<(app: IPlayerApp) => void>(
    (app) => {
      setPlayButtonEnabled(false);
      if (!app.songUrl) {
        // player.createFromSongUrl("https://piapro.jp/t/Eywb/20100804205216");
        player.createFromSongUrl(fallbackSongUrl);
      }
    },
    [player]
  );

  const onVideoReady = useCallback<(v?: IVideo) => void>(
    (v) => {
      if (!player) return;

      const qs = new QuantizedSong(
        player.data.songMap.beats,
        player.video.phrases,
        player.data.songMap.segments
      );
      qs.quantize();
      setQuantizedSong(qs);
    },
    [player]
  );

  const onTimerReady = useCallback<(timer: SongleTimer) => void>(() => {
    setPlayButtonEnabled(true);
  }, [player]);

  const onTimeUpdate = useCallback<(position: number) => void>(
    (position) => {
      setPosition(position);

      const nowBeat = player.findBeat(position);
      if (!(quantizedSong && nowBeat)) return;

      setBeat(nowBeat);

      const nowBar = quantizedSong.findBar(position);
      setBar(nowBar);

      setPart((prev) => {
        if (nowBar?.part) {
          return nowBar.part;
        }
        return prev?.contains(position) ? prev : null;
      });

      const nowPhrase = nowBar?.phrase ?? null;
      setPhrase((prev) => {
        if (nowPhrase) {
          return nowPhrase;
        }
        return prev?.contains(position) ? prev : null;
      });
    },
    [player, quantizedSong]
  );

  const onPlay = useCallback(() => setPlayState(true), []);
  const onPause = useCallback(() => setPlayState(false), []);
  const onStop = useCallback(() => {
    setPosition(null);
    setBeat(null);
    setBar(null);
    setPart(null);
    setPhrase(null);
  }, []);

  const listeners = useMemo(() => {
    return {
      onAppReady,
      onVideoReady,
      onPlay,
      onPause,
      onStop,
      onTimeUpdate,
      onTimerReady,
    };
  }, [
    onAppReady,
    onVideoReady,
    onPlay,
    onPause,
    onStop,
    onTimeUpdate,
    onTimerReady,
  ]);

  useEffect(() => {
    if (!mediaElement) return;

    if (!player) {
      const p = new Player({
        app: {
          token,
        },
        mediaElement: mediaElement.current,
      });
      const storedVolume = parseInt(localStorage.getItem("volume"));
      const storedIsMute = localStorage.getItem("mute") === "true";
      setInitialVolume(isNaN(storedVolume) ? 50 : storedVolume);
      setInitialMuteState(storedIsMute);
      p.volume = storedIsMute ? 0 : storedVolume;
      setPlayer(p);
    } else {
      player.addListener(listeners);
    }

    return () => {
      player?.removeListener(listeners);
    };
  }, [token, player, mediaElement, listeners]);

  return (
    <div>
      <div className={styles.container}>
        <div></div>
        <div>
          <SceneScreen
            position={position}
            beat={beat}
            bar={bar}
            part={part}
            phrase={phrase}
          />
        </div>
        <div className={styles.information}>
          <div>
            <InformationModalDialog />
          </div>
        </div>
      </div>
      <div className={styles.media}>
        <MediaController
          player={player}
          onUpdateMediaDom={setMediaElement}
          initialMuteState={isInitialMute}
          initialVolume={initialVolume}
          isPlaying={isPlaying}
          isEnablePlayButton={isEnablePlayButton}
        />
      </div>
    </div>
  );
};
export default index;
