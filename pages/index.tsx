import React, {
  isValidElement,
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
  Song,
  SongleTimer,
  stringToDataUrl,
  VideoEntry,
} from "textalive-app-api";
import styles from "@/pages/index.module.scss";
import MediaController from "~/components/MediaController";
import QuantizedSong from "~/models/Beats/QuantizedSong";
import QuantizedPhrase from "~/models/Beats/QuantizedPhrase";
import Part from "~/models/Beats/Part";
import QuantizedBar from "~/models/Beats/QuantizedBar";
import SceneScreen from "~/components/SceneScreen";
import InformationModalDialog from "~/components/InformationModalDialog";
import MediaModalDialog from "~/components/MediaModalDialog";

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
  const [isOpeningMediaModal, setMediaInfoModalOpeningState] = useState(false);
  const [isParsableSong, setParsableState] = useState<boolean>(false);

  const [song, setSong] = useState<Song>(null);
  const [quantizedSong, setQuantizedSong] = useState<QuantizedSong>(null);
  const [position, setPosition] = useState<number>(null);
  const [beat, setBeat] = useState<IBeat>(null);
  const [bar, setBar] = useState<QuantizedBar>(null);
  const [part, setPart] = useState<Part>(null);
  const [phrase, setPhrase] = useState<QuantizedPhrase>(null);

  const onAppReady = useCallback<(app: IPlayerApp) => void>(
    (app) => {
      setPlayButtonEnabled(false);
      if (!app.songUrl) {
        player.createFromSongUrl(fallbackSongUrl);
      }
    },
    [player, fallbackSongUrl]
  );

  const onAppMediaChange = useCallback<
    (songUrl: string, videoPromise?: Promise<IVideo>) => void
  >(() => {
    setPlayState(false);
    setPlayButtonEnabled(false);
  }, []);

  const onVideoLoad = useCallback<(video: VideoEntry, reason?: Error) => void>(
    (video, reason) => {
      setPart(null);
      setPosition(null);
      setBeat(null);
      setBar(null);
      setPhrase(null);
    },
    []
  );

  const onVideoReady = useCallback<(v?: IVideo) => void>(
    (v) => {
      if (!player) return;

      if (
        !player.video.firstPhrase ||
        player.data.songMap.segments.length <= 0 ||
        player.data.songMap.beats.length <= 0
      ) {
        setParsableState(false);

        return;
      } else {
        setParsableState(true);
      }

      setSong(player.data.song);
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
    setPlayButtonEnabled(isParsableSong);
  }, [player, isParsableSong]);

  const onTimeUpdate = useCallback<(position: number) => void>(
    (position) => {
      if (!isParsableSong) return;

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
    [player, quantizedSong, isParsableSong]
  );

  const onPlay = useCallback(() => setPlayState(true), []);
  const onPause = useCallback(() => setPlayState(false), []);
  const onStop = useCallback(() => setPlayState(false), []);
  const onRequestedStop = useCallback(() => {
    setPosition(null);
    setBeat(null);
    setBar(null);
    setPart(null);
    setPhrase(null);
  }, []);
  const requestPlay = useCallback<() => boolean>(() => {
    if (player) {
      return player.requestPlay();
    }
    return false;
  }, [player]);
  const onClickMediaInfo = useCallback(() => {
    setMediaInfoModalOpeningState(true);
  }, []);
  const mediaModalCloser = useCallback(() => {
    setMediaInfoModalOpeningState(false);
  }, []);
  const onChangeUrl = useCallback<(url: string) => Promise<boolean | null>>(
    async (url: string) => {
      if (player && url) {
        const res = await player.createFromSongUrl(url);

        if (!res) return null;
        return !!res.firstPhrase;
      }
      return null;
    },
    [player]
  );
  const restoreDefaultUrl = useCallback(() => {
    if (player) player.createFromSongUrl(fallbackSongUrl);
  }, [player, fallbackSongUrl]);

  const listeners = useMemo(() => {
    return {
      onAppReady,
      onAppMediaChange,
      onVideoLoad,
      onVideoReady,
      onPlay,
      onPause,
      onStop,
      onTimeUpdate,
      onTimerReady,
    };
  }, [
    onAppReady,
    onAppMediaChange,
    onVideoLoad,
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
            song={song}
            isPlayable={isEnablePlayButton}
            isPlaying={isPlaying}
            requestPlay={requestPlay}
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
          onRequestedStop={onRequestedStop}
          initialMuteState={isInitialMute}
          initialVolume={initialVolume}
          isPlaying={isPlaying}
          isEnablePlayButton={isEnablePlayButton}
          onClickInfo={onClickMediaInfo}
        />
      </div>
      <MediaModalDialog
        song={song}
        open={isOpeningMediaModal}
        closer={mediaModalCloser}
        onChangeUrl={onChangeUrl}
        restoreDefaultUrl={restoreDefaultUrl}
      />
    </div>
  );
};
export default index;
