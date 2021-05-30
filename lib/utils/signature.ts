import EthCrypto from 'eth-crypto';

function removeNotSignProperties(obj: AnyObject) {
    obj = JSON.parse(JSON.stringify(obj));
    for (let key in obj) {
        if (key[0] === '@' || key === 'signature') {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            this.removeNotSignProperties(obj[key]);
        }
    }
    return obj;
}

type mulripleStringArray = (string | mulripleStringArray)[];
function obj2Array(obj: AnyObject): mulripleStringArray[] {
    return Object.keys(obj)
        .sort()
        .map((key) => {
            if (typeof obj[key] === 'object') {
                return [key, obj2Array(obj[key])];
            } else {
                return [key, obj[key]];
            }
        });
}

export default {
    hash(source: AnyObject | string) {
        let message;
        if (typeof source === 'object') {
            message = obj2Array(removeNotSignProperties(source));
        } else if (typeof source === 'string') {
            message = source;
        }
        return EthCrypto.hash.keccak256(JSON.stringify(message));
    },
};
