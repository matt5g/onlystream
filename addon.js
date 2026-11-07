import stremioSDK from 'stremio-addon-sdk';
const { addonBuilder } = stremioSDK;
import { findBestStream, sortStreams } from "./sort-streams.js"
import config from "./config.json" with { type: "json" }
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.OnlyStream",
	"version": "0.0.1",
	"catalogs": [],
	"resources": ['stream'],
	"types": ['movie', 'series', 'tv'],
	"idPrefixes": ["tt"],
	"name": "OnlyStream",
	"description": "wip"
}
const builder = new addonBuilder(manifest)

const addonUrls = config.addonUrls;
let streams = [];
builder.defineStreamHandler(async ({ type, id }) => {
    const results = await Promise.allSettled(
        addonUrls.map(async (manifestUrl) => {
            const baseUrl = manifestUrl.replace(/\/manifest\.json\/?$/, '');

            const response = await fetch(
                `${baseUrl}/stream/${type}/${encodeURIComponent(id)}.json`,
                { signal: AbortSignal.timeout(8000) }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.streams || [];
        })
    );
	
    streams = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);
	
	console.log(`Found ${streams.length} streams for ${type} ${id}`);
    let sortedStreams = sortStreams(streams);
	let bestStream = await findBestStream(sortedStreams);
	console.log(`Best stream for ${type} ${id}:`, bestStream);
	return {"streams":[bestStream]};
});

export default builder.getInterface()