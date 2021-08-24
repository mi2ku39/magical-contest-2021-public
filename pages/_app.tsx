import { AppProps } from "next/dist/next-server/lib/router/router";
import React from "react";
import "@/styles/css/main.scss";

const app = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};
export default app;
