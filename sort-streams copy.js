import config from "./config.json" with { type: "json" };
import probe from "./torrent-probe.js";
//import { probe } from "./torrent-probe.js";
let streamInt = 0
let topStreams = []
const getPeers = function(stream) {
    if (!stream || !stream.description) {
        return 0;
    }
    stream.peers = Number(stream.description.match(/🌱 (\d+)/)?.[1] ?? 0);
    
    return stream.peers;
};


const sortStreams = function(streams) {
    if (!streams || streams.length === 0) {
        return [];
    }
    const torrentStreams = streams
        .filter(stream => stream.description.includes("🌱"))
        .sort((a, b) => getPeers(b) - getPeers(a))
        .filter(stream => stream.peers <= config.peerLimit)
    
    for (const stream of torrentStreams) {
        delete stream.peers;
    }
    const theRest = streams
        .filter(stream => !stream.description.includes("🌱"))
        .filter(stream => config.allowedResolutions.some(resolution => config.allowedResolutions.includes(resolution)));
    const sortedStreams = config.includeHTTPStreams ? [...torrentStreams, ...theRest] : [...torrentStreams];
    return sortedStreams;
};
const topHlfDzn = function(streams) {
    if (!streams || streams.length === 0) {
        return [];
    }
    const sortedStreams = sortStreams(streams);
    for (let i = 0; i <= config.maxConcurrentProbes; i++) {
        topStreams[i] = sortedStreams[i];
    }
    return topStreams;

}

const findBestStream = async function(streams) {
    if (!streams || streams.length === 0) {
        return null;
    }
    let sortedStreams = sortStreams(streams);
    let contenders = sortedStreams.slice(0, config.maxConcurrentProbes);
    let infoHashes = contenders.map(stream => stream.infoHash);
    let finalStream = await probe(infoHashes).then( async results => {
        let bestStream = null;
        let maxResultsMtabl = config.maxConcurrentProbes;
        let bestPeers = 0;
        for (let i = 0; i < maxResultsMtabl; i++) {
            if (results[i].peers > bestPeers) {
                bestPeers = results[i].peers;
                bestStream = contenders[i];
                console.log(`New best stream: ${bestStream.name} (${bestStream.infoHash}) with ${bestPeers} peers`);
                
            }
            if (i === maxResultsMtabl - 1 && bestPeers < config.minPeers) {
                    maxResultsMtabl += 2;
                    contenders.push(...sortedStreams.slice(maxResultsMtabl - 2, maxResultsMtabl));
                    let newContenders = sortedStreams.slice(maxResultsMtabl - 2, maxResultsMtabl);
                    infoHashes = newContenders.map(stream => stream.infoHash);
                    let newResults = await probe(infoHashes)
                    results.push(...newResults);
                }
        }

        console.log(`Best stream: ${bestStream.name} (${bestStream.infoHash}) with ${bestPeers} peers`);
        bestStream.name = "⭐ OnlyStream Recommended\n" + bestStream.name;
        return bestStream;
    });
    return finalStream;
}

export { sortStreams, findBestStream, topStreams };