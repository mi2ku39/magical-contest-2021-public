import { CSSProperties } from "react";

type Props = {
  style?: CSSProperties;
  width?: string;
  height?: string;
};

const DummyImage: React.FC<Props> = ({ width, height, style }) => (
  <div style={{ width, height, backgroundColor: "#eeeeee", ...style }}></div>
);
export default DummyImage;
