import WebTorrent from 'webtorrent';
import config from './config.json' with { type: 'json' };
const client = new WebTorrent();

const PROBE_TIMEOUT = 8000;
const MAX_CONCURRENT = config.maxConcurrentProbes;

function probeOne(infoHash) {
    return new Promise(resolve => {
        let metadata = false;
        let connections = 0;
        let finished = false;

        let torrent;

        const timer = setTimeout(finish, PROBE_TIMEOUT);

        function finish() {
            if (finished) return;
            finished = true;

            clearTimeout(timer);

            const result = {
                infoHash,
                metadata,
                peers: torrent?.numPeers ?? 0,
                connections
            };

            if (torrent) {
                client.remove(infoHash).catch(console.error);
            }

            resolve(result);
        }

        try {
            torrent = client.add(infoHash, {
                deselect: true
            });

            torrent.on('metadata', () => {
                metadata = true;
            });

            torrent.on('wire', () => {
                connections++;
            });

            torrent.on('error', error => {
                console.error(`Probe error (${infoHash}):`, error.message);
                finish();
            });

        } catch (error) {
            console.error(error);
            finish();
        }
    });
}

export async function probeStreams(infoHashes) {
    const results = [];

    for (let i = 0; i < infoHashes.length; i += MAX_CONCURRENT) {
        const batch = infoHashes.slice(i, i + MAX_CONCURRENT);

        const batchResults = await Promise.all(
            batch.map(probeOne)
        );

        results.push(...batchResults);
    }

    return results;
}

export default probeStreams;