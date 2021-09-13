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
import SegumentScreen from "~/components/SegmentScreen";
import QuantizedSong from "~/models/Beats/QuantizedSong";
import QuantizedSongScreen from "~/components/QuantizedSongScreen";
import QuantizedPhrase from "~/models/Beats/QuantizedPhrase";

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

  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();
  const [now, setTime] = useState<number>();
  const [beat, setBeat] = useState<IBeat>();
  const [chord, setChord] = useState<IChord>();
  const [phrase, setPhrase] = useState<QuantizedPhrase>();
  const displayBars = useMemo<string>(
    () =>
      beat
        ? `${Math.floor(beat.index / beat.length)}.${beat.position} Bars`
        : "-",
    [beat]
  );

  const [seguments, setSeguments] = useState<IRepetitiveSegments[]>([]);
  const [quantizedSong, setQuantizedSong] = useState<QuantizedSong>();

  const onAppReady = useCallback<(app: IPlayerApp) => void>(
    (app) => {
      setPlayButtonEnabled(false);
      if (!app.songUrl) {
        player.createFromSongUrl(fallbackSongUrl);
      }
    },
    [player]
  );

  const onVideoReady = useCallback<(v?: IVideo) => void>(
    (v) => {
      if (!player) return;
      const beats = player.data.songMap.beats;
      setStartTime(beats[0].startTime);
      setEndTime(beats[beats.length - 1].endTime);
      setSeguments(player.data.songMap.segments);

      const qs = new QuantizedSong(
        player.data.songMap.beats,
        player.video.phrases,
        player.data.songMap.segments
      );
      qs.quantize();
      setQuantizedSong(qs);
      console.log(qs);
    },
    [player]
  );

  const onTimerReady = useCallback<(timer: SongleTimer) => void>(() => {
    setPlayButtonEnabled(true);
  }, [player]);

  const onTimeUpdate = useCallback<(position: number) => void>(
    (position) => {
      console.log(`${position}ms`);

      const beat = player.findBeat(position);
      setBeat(beat);
      setChord(player.findChord(position));
      setTime(position);

      const p = quantizedSong?.find(beat.index)?.phrase ?? null;
      if (p) {
        setPhrase(p);
      } else {
        setPhrase((prev) => (prev?.contains(position) ? prev : null));
      }
    },
    [player, quantizedSong]
  );

  const onPlay = useCallback(() => setPlayState(true), []);
  const onPause = useCallback(() => setPlayState(false), []);
  const onStop = useCallback(() => {
    setBeat(null);
    setChord(null);
    setTime(null);
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
      setPlayer(
        new Player({
          app: {
            token,
          },
          mediaElement: mediaElement.current,
        })
      );
    } else {
      const v = parseInt(localStorage.getItem("volume"));
      const isMute = localStorage.getItem("mute") === "true";
      setInitialVolume(isNaN(v) ? 50 : v);
      setInitialMuteState(isMute);
      player.volume = isMute ? 0 : v;

      player.addListener(listeners);
    }

    return () => {
      player?.removeListener(listeners);
    };
  }, [token, player, mediaElement, listeners]);

  return (
    <div>
      <div>start time: {startTime}</div>
      <div>time: {now ? Math.round(now) : "-"}</div>
      <div>bars : {displayBars}</div>
      <div>chord: {chord ? chord.name : "-"}</div>
      <div>{phrase ? phrase.phrase.text : "-"}</div>
      {/* <SegumentScreen
        startTime={startTime}
        endTime={endTime}
        now={now}
        seguments={seguments}
        hiddenDetailTable
      /> */}

      <QuantizedSongScreen
        startTime={startTime}
        endTime={endTime}
        now={now}
        quantizedSong={quantizedSong}
        displayBars={displayBars}
      />

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
