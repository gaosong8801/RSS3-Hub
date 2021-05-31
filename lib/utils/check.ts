import config from '../config';

function valueLength(obj: AnyObject) {
    let result = true;
    for (let key in obj) {
        if (typeof obj[key] === 'object' && !valueLength(obj[key])) {
            result = false;
            break;
        } else if (obj[key].length && obj[key].length > config.maxValueLength) {
            result = false;
            break;
        }
    }
    return result;
}

function parseId(id: string) {
    const splited = id.split('-');
    return {
        persona: splited[0],
        type: splited[1],
        index: parseInt(splited[2]),
    };
}

export default {
    valueLength,
    parseId,

    idFormat(id: string, type?: string) {
        const parsed = parseId(id);
        if (!type) {
            return parsed.persona == id;
        } else {
            if (parsed.type !== type) {
                return false;
            }
            if (Number.isNaN(parsed.index)) {
                return false;
            }
            if (`${parsed.persona}-${type}-${parsed.index}` !== id) {
                return false;
            }
            return true;
        }
    },
};
