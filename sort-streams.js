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
        .filter(stream =>
            config.allowedResolutions.some(resolution =>
                stream.name?.includes(resolution) ||
                stream.description?.includes(resolution)
    )
);
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

    const sortedStreams = sortStreams(streams);

    const initialCount = config.maxConcurrentProbes;
    let contenders = sortedStreams.slice(0, initialCount);

    if (contenders.length === 0) return null;

    // Probe the initial candidates
    let results = await probe(contenders.map(s => s.infoHash));

    let bestStream = null;
    let bestPeers = -1;

    // Find the best result
    const evaluateResults = (streams, results) => {
        for (let i = 0; i < streams.length; i++) {
            const peers = Number(results[i]?.peers ?? 0);

            if (peers > bestPeers) {
                bestPeers = peers;
                bestStream = streams[i];

                console.log(
                    `New best stream: ${bestStream.name} (${bestStream.infoHash}) with ${bestPeers} peers`
                );
            }
        }
    };

    evaluateResults(contenders, results);

    // Failback: probe two more only if nobody meets minPeers
    if (bestPeers < config.minPeers) {
        const newContenders = sortedStreams.slice(
            initialCount,
            initialCount + 2
        );

        if (newContenders.length > 0) {
            console.log("No suitable streams found. Probing two backups...");

            const newResults = await probe(
                newContenders.map(s => s.infoHash)
            );

            contenders.push(...newContenders);
            results.push(...newResults);

            evaluateResults(newContenders, newResults);
        }
    }

    if (!bestStream) return null;

    console.log(
        `Best stream: ${bestStream.name} (${bestStream.infoHash}) with ${bestPeers} peers`
    );

    bestStream.name = "⭐ OnlyStream Recommended\n" + bestStream.name;

    return bestStream;
};

export { sortStreams, findBestStream, topStreams };