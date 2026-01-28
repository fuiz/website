# Fuiz

Host live quizzes freely

<img src="https://gitlab.com/fuiz/website/-/raw/main/static/favicon.svg?ref_type=heads" width="128" height="128" alt="Fuiz icon">

[![License](https://img.shields.io/gitlab/license/fuiz/website?style=for-the-badge)](https://gitlab.com/fuiz/website/-/raw/main/LICENSE)

## Dependencies

This is the code for the website (developed in Svelte). It relies on two other components to function properly:

- Backend game server: Code is under [fuiz/hosted-server](https://gitlab.com/fuiz/hosted-server). The urls to it are defined by: `PUBLIC_BACKEND_URL` and `PUBLIC_WS_URL`. In production, this uses a serverless version [fuiz/cloudflare-serverless](https://gitlab.com/fuiz/cloudflare-serverless) hosted at [api.fuiz.org](https://api.fuiz.org/).
- Backend image server: Code is under [fuiz/corkboard](https://gitlab.com/fuiz/corkboard). The url to it is defined by `PUBLIC_CORKBOARD_URL`. In production, this uses a similar open source serverless version [fuiz/corkboard-serverless](https://gitlab.com/fuiz/corkboard-serverless) hosted at [corkboard.fuiz.org](https://corkboard.fuiz.org/).

Additionally, the website relies on Cloudflare APIs for viewing and updating the library. If you want to enable these features you need to use [wrangler](https://github.com/cloudflare/workers-sdk).

Due to the nature of fast development, it's not a goal at the moment to make self-hosting as easy as possible. Once things stabilize a bit more we will put an effort towards providing docker images.

## Developing

After installing dependancies with `bun install`, start a development server:

```bash
bun run dev
```

While we use `bun` ourselves, `npm` should work just as fine.

You might need the following environment variables (`.env.local`):

```bash
# the link to the current hosted version, production: fuiz.org
PUBLIC_DISPLAY_PLAY_URL="localhost:5173"
# same as above but with the actual protocol, production: https://fuiz.org
PUBLIC_PLAY_URL="http://localhost:5173"
# the game backend, production: https://api.fuiz.org
PUBLIC_BACKEND_URL="http://localhost:8787"
# same as above but a websocket url, production: wss://api.fuiz.org
PUBLIC_WS_URL="ws://localhost:8787"
# image server url, in pproduction: https://corkboard.fuiz.org
PUBLIC_CORKBOARD_URL="http://localhost:43907"
```

If you would like to setup backing up to gDrive then you need to create a Google application and set:

```bash
# Google Auth Client Id and Secret Key
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

## Library Publishing System

Fuiz uses a GitLab-based publishing system where users authenticate with GitLab OAuth, submit fuizzes via pull requests, and maintainers review before merging. Once merged, a webhook automatically syncs the fuiz to the live library.

See [GITLAB_PUBLISHING_SETUP.md](./GITLAB_PUBLISHING_SETUP.md) for complete setup instructions and environment variables.

## Status

The live components' status can be accessed on [status.fuiz.org](https://status.fuiz.org/).
