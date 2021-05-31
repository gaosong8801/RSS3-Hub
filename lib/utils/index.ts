import logger from './logger';
import storage from './storage';
import signature from './signature';

export default {
    logger,
    storage,
    signature,

    parseId: (id: string) => {
        const splited = id.split('-');
        return {
            persona: splited[0],
            type: splited[1],
            index: parseInt(splited[2]),
        };
    },
};
