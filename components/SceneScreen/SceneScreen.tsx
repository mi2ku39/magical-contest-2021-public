import React from "react";
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

const SceneScreen: React.FC<Props> = ({
  position,
  beat,
  bar,
  part,
  phrase,
}) => {
  return (
    <div>
      <div>{beat && bar && `${bar.index}.${beat.position} Bars`}</div>
      <div>{phrase && phrase.phrase.text}</div>
      <div>{part && part.partType && part.partType}</div>
    </div>
  );
};
export default SceneScreen;
