import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";

const SceneJ: React.FC<SceneProps> = ({ position, beat, bar, phrase }) => {
  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
    </div>
  );
};

export default SceneJ;
