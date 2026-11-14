import stremioSDK from 'stremio-addon-sdk';
const { addonBuilder } = stremioSDK;
import { findBestStream, sortStreams, getLastStream } from "./sort-streams.js"
import config from "./config.json" with { type: "json" }
import { addToBlacklist } from "./blacklist-mgr.js"
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.OnlyStream",
	"version": "0.0.1",
	"catalogs": [],
	"resources": ['stream', 'subtitles'],
	"types": ['movie', 'series', 'tv'],
	"idPrefixes": ["tt"],
	"name": "OnlyStream",
	"description": "wip"
}
const builder = new addonBuilder(manifest)
try {
    process.loadEnvFile();
} catch (err) {
    console.warn("No .env file found, proceeding without it.");
}
const reportButton = {
  name: '⛓️‍💥 Report Broken Video',
  description: 'Select if video is broken or did \nnot load, then exit episode\n and select again to reload',
  infoHash: '45663750e9b732b4737a62ea57797ddb1718186a', //i have got a 10 inch penis 69420 to SHA-1
  fileIdx: 2,
  behaviorHints: {
    bingeGroup: 'aiostreamsfortheweebsstable.midnightignite.me|no service|false|1080p|BluRay|HEVC|AAC|10bit|English',
    filename: 'report-broken.mkv',
    videoSize: 1331439862
  }
}
const addonUrls = config.addonUrls.length !== 0 ? config.addonUrls : process.env.ADDON_URLS?.split(',');
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
	
    let streams = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);
	
	console.log(`Found ${streams.length} streams for ${type} ${id}`);
    let sortedStreams = await sortStreams(streams);
	let bestStream = await findBestStream(sortedStreams);
	console.log(`Best stream for ${type} ${id}:`, bestStream);
	return {"streams":[bestStream, reportButton]};
});
builder.defineSubtitlesHandler(async function(args) {
    if(args.extra.filename == 'report-broken.mkv') {
        console.log(getLastStream())
        await addToBlacklist(getLastStream().infoHash)
    }
})

export default builder.getInterface()