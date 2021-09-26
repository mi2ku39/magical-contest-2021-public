import { useCallback, useEffect } from "react";
import { SceneProps } from "../../SceneScreen";
import sceneStyle from "../general.module.scss";

const SceneF: React.FC<SceneProps> = ({
  isParentMounted,
  setRenderOnClickListeners,
  phrase,
}) => {
  const onClickRender = useCallback(() => {
    console.log("test");
  }, []);

  useEffect(() => {
    if (isParentMounted) {
      setRenderOnClickListeners((prev) => {
        if (!prev.includes(onClickRender)) {
          prev.push(onClickRender);
        }
        return prev;
      });
    }

    return () => {
      if (isParentMounted) {
        setRenderOnClickListeners((prev) => {
          if (prev.includes(onClickRender)) {
            return prev.filter((it) => it !== onClickRender);
          }
          return prev;
        });
      }
    };
  }, [isParentMounted]);
  return (
    <div className={sceneStyle.container}>
      <div className={sceneStyle.phraseContainer}>
        <div className={sceneStyle.phrase}>{phrase && phrase.phrase.text}</div>
      </div>
    </div>
  );
};

export default SceneF;
