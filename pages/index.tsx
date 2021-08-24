import React, { useCallback, useEffect, useRef, useState } from "react";
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

  const mediaElement = useRef<HTMLDivElement>();
  const mediaBannerElement = useRef<HTMLDivElement>();

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
  }, [
    token,
    player,
    mediaElement,
    mediaBannerElement,
    onAppReady,
    onSongMapLoad,
    onVideoReady,
  ]);

  return (
    <>
      <div className={styles.media}>
        <div ref={mediaElement}></div>
        <div className={styles.controllerContainer}>
          <div>
            <ControllerButton
              src="/images/icons/replay.svg"
              balloonText="最初に戻す"
            />
          </div>
          <div>
            <ControllerButton src="/images/icons/play.svg" balloonText="再生" />
          </div>
          <div className={styles.rightItemContainer}>
            <VolumeControllerButton />
          </div>
        </div>
      </div>
    </>
  );
};
export default index;
