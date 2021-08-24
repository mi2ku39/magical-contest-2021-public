import { useCallback } from "react";
import ControllerButton from "../ControllerButton";
import styles from "./VolumeControllerButton.module.scss";

type Props = {};

const VolumeControllerButton: React.FC<Props> = ({}) => {
  const onClick = useCallback(() => {}, []);

  return (
    <div className={styles.container}>
      <div className={styles.faderContainer}>
        <div className={styles.inner}>
          <div className={styles.guageTop}></div>
          <div className={styles.guageKnob}> </div>
          <div className={styles.guageBottom}></div>
        </div>
      </div>
      <ControllerButton src="/images/icons/volume_down.svg" onClick={onClick} />
    </div>
  );
};
export default VolumeControllerButton;
