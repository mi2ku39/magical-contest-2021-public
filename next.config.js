require("dotenv").config();
module.exports = {
  basePath:
    process.env.NODE_ENV === "production" ? "/magical-contest-2021" : "",
  env: {
    NEXT_PUBLIC_TEXTALIVE_APP_TOKEN: process.env.TEXTALIVE_APP_TOKEN,
    NEXT_PUBLIC_FALLBACK_SONG_URL: process.env.FALLBACK_SONG_URL,
  },
};
