import { IBeat } from "textalive-app-api";
import Part from "~/models/Beats/Part";
import QuantizedBar from "~/models/Beats/QuantizedBar";
import QuantizedPhrase from "~/models/Beats/QuantizedPhrase";

type Props = {
  position?: number;
  beat?: IBeat;
  bar?: QuantizedBar;
  part?: Part;
  phrase?: QuantizedPhrase;
};

export type SceneProps = {
  position?: number;
  beat?: IBeat;
  bar?: QuantizedBar;
  phrase?: QuantizedPhrase;
};

const SceneScreen: React.FC<Props> = ({
  position,
  beat,
  bar,
  part,
  phrase,
}) => {
  return (
    <div>
      <div>
        {beat && bar ? `${bar.index}.${beat.position} Bars` : "bar null"}
      </div>
      <div>{phrase ? phrase.phrase.text : "phrase null"}</div>
      <div>{part ? part.partType : "part null"}</div>
    </div>
  );
};
export default SceneScreen;
