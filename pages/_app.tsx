import { AppProps } from "next/dist/next-server/lib/router/router";
import React from "react";

const app = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};
export default app;
