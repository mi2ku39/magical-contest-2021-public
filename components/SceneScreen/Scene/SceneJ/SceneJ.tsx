import { SceneProps } from "../../SceneScreen";

const SceneJ: React.FC<SceneProps> = ({ position, beat, bar, phrase }) => {
  return (
    <div>
      <div>
        {beat && bar ? `${bar.index}.${beat.position} Bars` : "bar null"}
      </div>
      <div>{phrase ? phrase.phrase.text : "phrase null"}</div>
      <div>part A</div>
    </div>
  );
};

export default SceneJ;
