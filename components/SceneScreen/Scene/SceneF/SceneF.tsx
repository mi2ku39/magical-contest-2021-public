import { useCallback, useEffect } from "react";
import DummyImage from "~/components/DummyImage";
import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneF.module.scss";

const SceneF: React.FC<SceneProps> = ({
  isParentMounted,
  setRenderOnClickListeners,
  phrase,
}) => {
  const onClickRender = useCallback(() => {
    console.log("test");
  }, []);

  useEffect(() => {
    if (isParentMounted) {
      setRenderOnClickListeners((prev) => {
        if (!prev.includes(onClickRender)) {
          prev.push(onClickRender);
        }
        return prev;
      });
    }

    return () => {
      if (isParentMounted) {
        setRenderOnClickListeners((prev) => {
          if (prev.includes(onClickRender)) {
            return prev.filter((it) => it !== onClickRender);
          }
          return prev;
        });
      }
    };
  }, [isParentMounted]);
  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.imageInner}>
          <div className={styles.onStageContainer}>
            <div className={styles.performerContainer}>
              <div>
                <DummyImage width="10rem" height="20rem" />
              </div>
            </div>
            <div className={styles.machineContainer}>
              <div className={styles.leftSpeaker}>
                <DummyImage width="8rem" height="15rem" />
              </div>
              <div className={styles.leftMic}>
                <DummyImage width="6rem" height="4rem" />
              </div>
              <div className={styles.rightMic}>
                <DummyImage width="6rem" height="4rem" />
              </div>
              <div className={styles.rightSpeaker}>
                <DummyImage width="8rem" height="15rem" />
              </div>
            </div>
          </div>
          <div className={styles.stageContainer}>
            <DummyImage width="70rem" height="6rem" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneF;
