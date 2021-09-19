import { useMemo } from "react";
import { IBeat } from "textalive-app-api";
import Part, { PartTypes } from "~/models/Beats/Part";
import QuantizedBar from "~/models/Beats/QuantizedBar";
import QuantizedPhrase from "~/models/Beats/QuantizedPhrase";
import DefaultScene from "./Scene/DefaultScene";
import SceneA from "./Scene/SceneA";
import styles from "./SceneScreen.module.scss";

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

const SceneRender: React.FC<Props> = (props) => {
  switch (props.part?.partType) {
    case PartTypes.A:

    case PartTypes.B:

    case PartTypes.C:

    case PartTypes.D:

    case PartTypes.D:

    case PartTypes.E:

    case PartTypes.F:

    case PartTypes.G:

    case PartTypes.H:

    case PartTypes.I:

    default:
      return <DefaultScene {...props} />;
  }
};

const SceneScreen: React.FC<Props> = ({
  position,
  beat,
  bar,
  part,
  phrase,
}) => {
  const props = useMemo(() => {
    return { position, beat, bar, phrase };
  }, [position, beat, bar, phrase]);

  return (
    <div className={styles.container}>
      <SceneRender {...props} />
    </div>
  );
};
export default SceneScreen;
