import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";
import styles from "./SceneA.module.scss";

const SceneA: React.FC<SceneProps> = ({ position, beat, bar, phrase }) => {
  return (
    <div className={sceneStyle.container}>
      <div>
        {beat && bar ? `${bar.index}.${beat.position} Bars` : "bar null"}
      </div>
      <div>{phrase ? phrase.phrase.text : "phrase null"}</div>
      <div>SceneA</div>
    </div>
  );
};

export default SceneA;
