import React, {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Song } from "textalive-app-api";
import ModalDialog from "../ModalDialog";
import styles from "./MediaModalDialog.module.scss";

type Props = {
  open: boolean;
  closer: () => void;
  isPlayable?: boolean;
  song?: Song;
  onChangeUrl?: (url: string) => Promise<boolean | null>;
  restoreDefaultUrl?: () => void;
};

const MediaModalDialog: React.FC<Props> = ({
  open,
  closer,
  song,
  onChangeUrl,
  restoreDefaultUrl,
}) => {
  const [url, setUrl] = useState<string>();
  const [isLoading, setLoadingState] = useState<boolean>(false);
  const [reason, setErrorMessage] = useState<string>(null);

  const onInputUrl = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setUrl(event.target.value);
    },
    []
  );

  const onSubmit = useCallback<FormEventHandler>(
    (event) => {
      if (onChangeUrl) {
        setLoadingState(true);
        onChangeUrl(url)
          .then((it) => {
            if (it === false) {
              setErrorMessage(
                "歌詞データのない楽曲であるため、読み込むことができません。"
              );
              restoreDefaultUrl();
              return;
            }

            if (it === null) {
              setErrorMessage(
                "登録されていないURLのため、読み込むことができません。"
              );
              return;
            }

            setErrorMessage(null);
            closer();
            return;
          })
          .finally(() => {
            setLoadingState(false);
          });
      }
      event.preventDefault();
    },
    [onChangeUrl, url]
  );

  const onClickRestore = useCallback(() => {
    if (restoreDefaultUrl) {
      restoreDefaultUrl();
      closer();
    }
  }, [restoreDefaultUrl]);

  const isUrl = useMemo(
    () => !!url && !!url.match(/(http|https):\/\/.+/),
    [url]
  );

  useEffect(() => {
    if (song) setUrl(song.permalink);
  }, [song]);

  return (
    <ModalDialog title="楽曲を変える" open={open} closer={closer}>
      <div className={styles.container}>
        <div>
          <a href="https://textalive.jp/songs" target="_blank">
            TextAlive
          </a>
          に登録されていて、歌詞データのある楽曲を読み込むことができます。
        </div>
        <div className={styles.caution}>
          うまく動かない場合は別の楽曲でお試しください。
        </div>
        <form className={styles.form} onSubmit={onSubmit}>
          <div>
            <label className={styles.input}>
              <div>URL (piapro / niconico / YouTube)</div>
              {reason && <div className={styles.caution}>{reason}</div>}
              <input
                type="text"
                id="url"
                defaultValue={url}
                onChange={onInputUrl}
              />
            </label>
          </div>
          <div>
            <input
              type="submit"
              value="読み込む"
              disabled={isLoading || !isUrl}
            />
          </div>
        </form>
        <div>
          <div>
            <button onClick={onClickRestore} disabled={isLoading}>
              初期値に戻す
            </button>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};
export default MediaModalDialog;
