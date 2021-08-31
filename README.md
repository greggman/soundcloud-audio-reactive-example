# Soundcloud Audio Reactive Example

Soundcloud changed their API to requirea token.
Here is a working example. Thank you Soundcloud!
example to work.

## Usage:

```
git clone https://github.com/greggman/soundcloud-audio-reactive-example.git
cd soundcloud-audio-reactive-example
npm init
CLIENT_ID="your-client-id" SECRET="your-secret" node index.js
```

Now open the browser to `http://localhost:8080` and open the
browser's dev tools.

### What happens:

1. page makes request to this server for a track URL
2. server asks soundcloud for an auth token
3. server uses token to call `/resolve` endpoint to get track info which includes stream_url
4. server requests actual track URL URL for `<audio>` tag
5. page waits for user to click
6. page sets `src` field of `<audio>` tag to URL from step 4 and uses WebAudio API to analyse music as it streams

### What used to happen:

This is what the code used to do. Unfortunately while it
worked with Chrome and Firefox it failed in Safari

1. page makes request to this server for a token
2. server asks soundcloud for an auth token, sends token to page
3. page uses token to call `/resolve` endpoint to get track info which includes stream_url
4. page uses `GET` request to try to get actual URL for `<audio>` tag
5. page waits for user to click
6. page sets `src` field of `<audio>` tag to URL from step 4 and uses WebAudio API to analyse music as it streams

