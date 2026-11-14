import probeProfiles from './probe-profiles.json' with { type: 'json' };

function getTimeCondition () {
    const time = new Date();
    const hours = time.getHours();
    if (hours >= 0 && hours < 9) {
        return 'aggressive';
    }
    return 'fast';
}

class ProbeConditions {
    constructor() {
        Object.assign(this, probeProfiles[getTimeCondition()]);
    }
}
export default ProbeConditions;