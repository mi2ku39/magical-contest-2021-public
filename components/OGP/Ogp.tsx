import Head from "next/head";

const Ogp: React.FC = () => (
  <Head>
    <title>密かなるにじそうさく</title>
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@nytimesbits" />
    <meta name="twitter:creator" content="@nickbilton" />
    <meta name="description" content="密かなるにじそうさく" />
    <meta
      property="og:url"
      content="https://denpaghost.github.io/magical-contest-2021/"
    />
    <meta property="og:title" content="密かなるにじそうさく" />
    <meta property="og:site_name" content="密かなるにじそうさく" />
    <meta property="og:description" content="密かなるにじそうさく" />
    <meta property="og:type" content="website" />
    <meta
      property="og:image"
      content="https://denpaghost.github.io/magical-contest-2021/ogps/ogp.png"
    />
    <meta property="og:image:width" content="1200px" />
    <meta property="og:image:height" content="630px" />
  </Head>
);
export default Ogp;
