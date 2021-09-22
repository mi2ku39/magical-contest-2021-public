import { useCallback, useState } from "react";
import Icon from "~/constants/Icon";
import ControllerButton from "../ControllerButton";
import ModalDialog from "../ModalDialog";
import styles from "./InformationModalDialog.module.scss";

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
        src={Icon.info}
        balloonText="このサイトについて"
        right
        onClick={onClick}
      />
      <ModalDialog
        title="このサイトについて"
        open={isOpen}
        closer={modalCloser}
      >
        <div className={styles.modalContainer}>
          <div className={styles.title}>密かなる二次創作</div>
          <div className={styles.description}>
            本Webアプリケーションは
            <a href="https://magicalmirai.com/2021/procon/" target="_blank">
              初音ミク「マジカルミライ 2021」プログラミング・コンテスト
            </a>
            応募作品です。
          </div>
          <div className={styles.contributorContainer}>
            <div>
              <div className={styles.contributeCategory}>企画・制作</div>
              <div className={styles.contributorName}>倉重みつき</div>
            </div>
          </div>
          <div className={styles.contributorContainer}>
            <div>
              <div className={styles.contributeCategory}>イラスト協力</div>
              <div className={styles.contributorName}>小鳥のあ</div>
            </div>
          </div>
          <div className={styles.contributorContainer}>
            <div>
              <div className={styles.contributeCategory}>モチーフ</div>
              <div className={styles.contributorName}>
                <div>
                  濁茶<span className={styles.small}>様</span>
                  「密かなる交信曲」
                </div>
              </div>
            </div>
          </div>
          <div className={styles.description}>
            <a
              href="https://www.apache.org/licenses/LICENSE-2.0.html"
              target="_blank"
            >
              Apache license 2.0
            </a>
            に基づき、Google Fontsのフォントとアイコンを利用しています。
          </div>
          <div className={styles.copyright}>
            &copy; 2021 Mitsuki Kurashige w/ GhostServer.
          </div>
        </div>
      </ModalDialog>
    </>
  );
};
export default InformationModalDialog;