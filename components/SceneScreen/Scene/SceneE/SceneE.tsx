import { useEffect } from "react";
import Illustration from "~/constants/Illustration";
import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneE.module.scss";

const SceneE: React.FC<SceneProps> = ({
  position,
  beat,
  bar,
  phrase,
  part,
}) => {
  useEffect(() => {}, [part]);

  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.imageInner}>
          <img src={Illustration.miku.fron} />
        </div>
      </div>
      <div className={styles.timingHint}></div>
    </div>
  );
};

export default SceneE;
