import React, { useMemo } from "react";
import { IBeat, Song } from "textalive-app-api";
import Part, { PartTypes } from "~/models/Beats/Part";
import QuantizedBar from "~/models/Beats/QuantizedBar";
import QuantizedPhrase from "~/models/Beats/QuantizedPhrase";
import DefaultScene from "./Scene/DefaultScene";
import SceneA from "./Scene/SceneA";
import SceneB from "./Scene/SceneB";
import SceneC from "./Scene/SceneC";
import SceneD from "./Scene/SceneD";
import SceneE from "./Scene/SceneE";
import SceneF from "./Scene/SceneF";
import SceneG from "./Scene/SceneG";
import SceneH from "./Scene/SceneH";
import SceneI from "./Scene/SceneI";
import styles from "./SceneScreen.module.scss";

type Props = {
  position?: number;
  beat?: IBeat;
  bar?: QuantizedBar;
  part?: Part;
  phrase?: QuantizedPhrase;
  song?: Song;
  requestPlay?: () => boolean;
  isPlayable?: boolean;
};

export type SceneProps = Omit<Props, "part">;

const SceneRender: React.FC<Props> = (props) => {
  const partType = useMemo(() => props.part?.partType ?? null, [props.part]);
  switch (partType) {
    case PartTypes.A:
      return <SceneA {...props} />;

    case PartTypes.B:
      return <SceneB {...props} />;

    case PartTypes.C:
      return <SceneC {...props} />;

    case PartTypes.D:
      return <SceneD {...props} />;

    case PartTypes.E:
      return <SceneE {...props} />;

    case PartTypes.F:
      return <SceneF {...props} />;

    case PartTypes.G:
      return <SceneG {...props} />;

    case PartTypes.H:
      return <SceneH {...props} />;

    case PartTypes.I:
      return <SceneI {...props} />;

    case PartTypes.J:
      return <SceneI {...props} />;

    default:
      return <DefaultScene {...props} />;
  }
};

const SceneScreen: React.FC<Props> = (props) => {
  return (
    <div className={styles.container}>
      <SceneRender {...props} />
    </div>
  );
};
export default SceneScreen;
