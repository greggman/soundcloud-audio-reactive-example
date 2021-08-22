# Soundcloud Audio Reactive Example

This example **does NOT WORK**.

Soundcloud changed their API but has provided no working
examples of how to use it. Hopefully they can update this
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

### What should happen:

1. page makes request to this server for a token
2. server asks soundcloud for an auth token, sends token to page
3. page uses token to call `/resolve` endpoint to get track info which includes stream_url
4. page uses `HEAD` request to try to get actual URL for `<audio>` tag
5. page waits for user to click
6. page sets `src` field of `<audio>` tag to URL from step 4 and uses WebAudio API to analyse music as it streams

### What happens instead:

Step 4 fails with:

```
Access to fetch at 'https://cf-media.sndcdn.com/93KvqnPvC3eJ.128.mp3?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLW1lZGlhLnNuZGNkbi5jb20vOTNLdnFuUHZDM2VKLjEyOC5tcDMqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjI5NjczNzAxfX19XX0_&Signature=BIFcISDWdt7c2X-uoRgIJDGrn3-KW8S0uh-H-Khtd-Foodm~-tkXcLLxd6XJ4DMnCKRBOL1qG8SxfI79TvYZgBo2NyX53SLXB19L-V1tNA4TR~FEVUZzCfKypG9AalfXbPcG8Wmk3y35Iv1OYQgAgy1Dpfro9hWynKMBtgc-nrFQYIO-pxBk~mq6EQPMfF8aBE7BqT7Iu-9Wi5TbsWkt5SpJDAMNR9T5x7hzcB6~TdV-wDlV3lX8k3Abz6kntLVmyQYE~BtsmfKtzy2zNJQbgvOs2PD5cxv~GQmXjb4KyrynL6xSx23Ro5VLYrwXjDc1PwJ~7euW5WBKJbWoYXZKzA__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ' (redirected from 'https://api.soundcloud.com/tracks/113332220/stream') from origin 'http://localhost:8080' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
(index):43 HEAD https://cf-media.sndcdn.com/93KvqnPvC3eJ.128.mp3?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLW1lZGlhLnNuZGNkbi5jb20vOTNLdnFuUHZDM2VKLjEyOC5tcDMqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjI5NjczNzAxfX19XX0_&Signature=BIFcISDWdt7c2X-uoRgIJDGrn3-KW8S0uh-H-Khtd-Foodm~-tkXcLLxd6XJ4DMnCKRBOL1qG8SxfI79TvYZgBo2NyX53SLXB19L-V1tNA4TR~FEVUZzCfKypG9AalfXbPcG8Wmk3y35Iv1OYQgAgy1Dpfro9hWynKMBtgc-nrFQYIO-pxBk~mq6EQPMfF8aBE7BqT7Iu-9Wi5TbsWkt5SpJDAMNR9T5x7hzcB6~TdV-wDlV3lX8k3Abz6kntLVmyQYE~BtsmfKtzy2zNJQbgvOs2PD5cxv~GQmXjb4KyrynL6xSx23Ro5VLYrwXjDc1PwJ~7euW5WBKJbWoYXZKzA__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ net::ERR_FAILED
```
