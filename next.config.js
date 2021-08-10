require('dotenv').config();
module.exports = {
    env: {
        NEXT_PUBLIC_TEXTALIVE_APP_TOKEN: process.env.TEXTALIVE_APP_TOKEN,
        NEXT_PUBLIC_FALLBACK_SONG_URL: process.env.FALLBACK_SONG_URL
    }
}
