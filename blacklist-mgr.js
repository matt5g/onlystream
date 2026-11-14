import fs from 'node:fs/promises';

class blacklistInstance extends Array {
    constructor(data = []) {
        super(...data);
    }
    static async create() {
        await fs.writeFile('./blacklist.json', '[]', { flag: 'wx' }).catch(() => {});
        const data = await fs.readFile('./blacklist.json')
        return new blacklistInstance(JSON.parse(data));
    }
}
const addToBlacklist = async function(infoHash) {
    let blacklist = await blacklistInstance.create();
    blacklist.push(infoHash)
    let toDisk = JSON.stringify(blacklist)
    await fs.writeFile('./blacklist.json', toDisk)
}
const removeFromBlacklist = async function(infoHash) {
    let blacklist = await blacklistInstance.create();
    blacklist = blacklist.filter(h => h !== infoHash);
    let toDisk = JSON.stringify(blacklist)
    await fs.writeFile('./blacklist.json', toDisk)
}
const isOnBlacklist = async function(infoHash) {
    let blacklist = await blacklistInstance.create();
    return blacklist.includes(infoHash)
}
export {addToBlacklist, removeFromBlacklist, blacklistInstance}