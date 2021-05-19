import dotenv from 'dotenv';
dotenv.config();

export default {
    storage: {
        type: process.env.STORAGE_TYPE || 'local',
        path: 'storage/',
        spacesName: process.env.SPACES_NAME,
        spacesEndPoint: process.env.SPACES_ENDPOINT,
        spacesKey: process.env.SPACES_KEY,
        spacesSecret: process.env.SPACES_SECRET,
    },
    itemPageSize: 2,
}