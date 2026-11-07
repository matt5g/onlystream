#!/usr/bin/env node

import stremioSDK from 'stremio-addon-sdk';

const { serveHTTP } = stremioSDK;

import addonInterface from "./addon.js"



serveHTTP(addonInterface, { port: process.env.PORT || 53955 })

// when you've deployed your addon, un-comment this line
// publishToCentral("https://my-addon.awesome/manifest.json")
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
