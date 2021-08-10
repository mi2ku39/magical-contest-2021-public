import React, { useCallback, useEffect, useState } from "react";
import { IPlayerApp, ISongMap, IVideo, Player } from "textalive-app-api";

const index: React.FC = () => {
  const [token] = useState<string>(process.env.NEXT_PUBLIC_TEXTALIVE_APP_TOKEN)
  const [fallbackSongUrl] = useState<string>(process.env.NEXT_PUBLIC_FALLBACK_SONG_URL)
  const [player, setPlayer] = useState<Player>(new Player(
    {
      app: {
        token
      }
    }
  ))

  const onAppReady = useCallback<(app: IPlayerApp) => void>((app) => {
    if (!app.songUrl) {
      player.createFromSongUrl(fallbackSongUrl)
    }
  }, [player])

  const onSongMapLoad = useCallback<(songMap?: ISongMap, reason?: Error) => void>((songMap, reason) => {
    console.dir(songMap)
  }, [])

  const onVideoReady = useCallback<(v?: IVideo) => void>((v) => {
    if (!v) return

    console.dir(v.firstPhrase)
  }, [])

  useEffect(() => {
    player.addListener({
      onAppReady,
      onSongMapLoad,
      onVideoReady
    })
  }, [token, fallbackSongUrl, player, onAppReady, onSongMapLoad, onVideoReady])

  return <div>hello</div>;
};
export default index;
