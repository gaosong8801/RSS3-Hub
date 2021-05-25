import dotenv from 'dotenv';
dotenv.config();

export default {
    itemPageSize: 20,
    listPageSize: 2000,
    maxValueLength: 280,
    storage: {
        type: process.env.STORAGE_TYPE || 'local',
        path: 'storage/',
        spacesName: process.env.SPACES_NAME,
        spacesEndPoint: process.env.SPACES_ENDPOINT,
        spacesKey: process.env.SPACES_KEY,
        spacesSecret: process.env.SPACES_SECRET,
    },
};
