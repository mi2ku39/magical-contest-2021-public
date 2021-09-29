import clsx from "clsx";
import Icon from "~/constants/Icon";
import ControllerButton from "../ControllerButton";
import styles from "./ModalDialog.module.scss";
type Props = {
  title: string;
  closer: () => void;
  open?: boolean;
};

const ModalDialog: React.FC<Props> = ({
  title,
  open = false,
  closer,
  children,
}) => (
  <div className={clsx(styles.container, !open && styles.hidden)}>
    <div className={styles.formContainer}>
      <div className={styles.closer} onClick={closer} />
      <div className={styles.form}>
        <div className={styles.formControl}>
          <div>{title}</div>
          <div>
            <ControllerButton
              src={Icon.close}
              balloonText="閉じる"
              onClick={closer}
            />
          </div>
        </div>
        <div className={styles.formInner}>{children}</div>
      </div>
    </div>
  </div>
);
export default ModalDialog;
