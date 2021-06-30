import dotenv from 'dotenv';
dotenv.config();

export default {
    itemPageSize: 100,
    listPageSize: 5000,
    maxValueLength: 280,
    maxDateGap: 2 * 60 * 60 * 1000,
    version: <'rss3.io/version/v0.1.0'>'rss3.io/version/v0.1.0',
    storage: {
        path: 'storage/',
        spacesName: process.env.SPACES_NAME,
        spacesEndPoint: process.env.SPACES_ENDPOINT,
        spacesKey: process.env.SPACES_KEY,
        spacesSecret: process.env.SPACES_SECRET,
    },
};
