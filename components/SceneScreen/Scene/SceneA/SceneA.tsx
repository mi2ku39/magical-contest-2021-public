import { SceneProps } from "../../SceneScreen";

const SceneA: React.FC<SceneProps> = ({ position, beat, bar, phrase }) => {
  return (
    <div>
      <div>
        {beat && bar ? `${bar.index}.${beat.position} Bars` : "bar null"}
      </div>
      <div>{phrase ? phrase.phrase.text : "phrase null"}</div>
      <div>SceneA</div>
    </div>
  );
};

export default SceneA;
