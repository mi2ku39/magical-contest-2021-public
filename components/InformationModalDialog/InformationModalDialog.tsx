import { useCallback, useState } from "react";
import Icon from "~/constants/Icon";
import ControllerButton from "../ControllerButton";
import ModalDialog from "../ModalDialog";

const InformationModalDialog: React.FC = () => {
  const [isOpen, setModalOpenState] = useState(false);
  const onClick = useCallback(() => {
    setModalOpenState(true);
  }, []);
  const modalCloser = useCallback(() => {
    setModalOpenState(false);
  }, []);

  return (
    <>
      <ControllerButton
        src={Icon.ghostserver}
        balloonText="このサイトについて"
        right
        onClick={onClick}
      />
      <ModalDialog
        title="このサイトについて"
        open={isOpen}
        closer={modalCloser}
      ></ModalDialog>
    </>
  );
};
export default InformationModalDialog;
