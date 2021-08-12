import React, { useCallback, useEffect, useRef, useState } from "react";
import { IPlayerApp, ISongMap, IVideo, Player } from "textalive-app-api";
import styles from "@/pages/index.module.scss";

const index: React.FC = () => {
  const [token] = useState<string>(process.env.NEXT_PUBLIC_TEXTALIVE_APP_TOKEN);
  const [fallbackSongUrl] = useState<string>(
    process.env.NEXT_PUBLIC_FALLBACK_SONG_URL
  );
  const [player, setPlayer] = useState<Player | null>(null);

  const mediaElement = useRef<HTMLDivElement>();

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
    console.dir(v.firstPhrase);
  }, []);

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
      });
    }
  }, [token, player, mediaElement, onAppReady, onSongMapLoad, onVideoReady]);

  return (
    <div>
      <img src="/images/icons/play.svg" />
      <div ref={mediaElement} className={styles.media}></div>
    </div>
  );
};
export default index;
