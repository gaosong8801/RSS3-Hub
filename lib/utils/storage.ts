import config from '../config';
import fs from 'fs';

if (config.storage.type === 'local' && !fs.existsSync(config.storage.path)) {
    fs.mkdirSync(config.storage.path);
}

export default {
    write: (name: string, content: string) => {
        if (config.storage.type === 'local') {
            fs.writeFileSync(config.storage.path + name, content);
        }
    },
    read: (name: string) => {
        if (config.storage.type === 'local') {
            return fs.readFileSync(config.storage.path + name, 'utf-8');
        }
    },
    exist: (name: string) => {
        if (config.storage.type === 'local') {
            return fs.existsSync(config.storage.path + name);
        }
    },
    rm: (name: string) => {
        if (config.storage.type === 'local') {
            fs.rmSync(config.storage.path + name);
        }
    }
};