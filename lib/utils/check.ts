import config from '../config';
import utilsId from './id';

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

export default {
    valueLength,

    idFormat(id: string, type: string) {
        const parsed = utilsId.parse(id);
        if (parsed.type !== type) {
            return false;
        }
        if (parsed.type !== 'index' && parsed.index === -1) {
            return false;
        }
        if (`${parsed.persona}-${type}-${parsed.index}` !== id) {
            return false;
        }
        return true;
    },
};
