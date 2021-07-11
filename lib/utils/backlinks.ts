import config from '../config';
import storage from './storage';
import id from './id';

export default {
    add: async (persona: string, list: RSS3LinksInput[]) => {
        list?.forEach((lks) => {
            lks.list.forEach(async (link) => {
                const file = <RSS3Index>await storage.read(link);
                if (!file['@backlinks']) {
                    file['@backlinks'] = [];
                }
                const oldLks = file['@backlinks'].find((blks) => blks.type === lks.type);
                if (oldLks) {
                    const listFile = <RSS3List>await storage.read(oldLks.list);
                    const now = new Date().toISOString();
                    if (listFile.list.length >= config.listPageSize) {
                        const newListId = id.addIndex(listFile.id, listFile.list_next);
                        const newContent: RSS3List = {
                            id: newListId,
                            '@version': config.version,
                            date_updated: now,
                            date_created: now,

                            list: listFile.list,
                        };
                        if (listFile.list_next) {
                            newContent.list_next = listFile.list_next;
                        }
                        storage.write(newContent);
                        listFile.list = [persona];
                        listFile.list_next = newListId;
                        listFile.date_updated = now;
                        storage.write(listFile);
                    } else {
                        listFile.list.push(persona);
                        listFile.date_updated = now;
                        storage.write(listFile);
                    }
                } else {
                    const now = new Date().toISOString();
                    const newId = `${persona}-backlink@${lks.type}`;
                    const newContent = {
                        id: newId,
                        '@version': config.version,
                        date_updated: now,
                        date_created: now,

                        list: [persona],
                    };
                    storage.write(newContent);

                    file['@backlinks'].push({
                        type: lks.type,
                        list: newId,
                    });
                    storage.write(file);
                }
            });
        });
    },

    remove: async (persona: string, list: RSS3LinksInput[]) => {
        list?.forEach((lks) => {
            lks.list.forEach(async (link) => {
                const file = <RSS3Index>await storage.read(link);
                if (!file['@backlinks']) {
                    return;
                }
                const oldLks = file['@backlinks'].find((blks) => blks.type === lks.type);
                if (oldLks) {
                    let fileId = oldLks.list;
                    let listFile;
                    do {
                        listFile = <RSS3List>await storage.read(fileId);
                        fileId = listFile.list_next;
                    } while (listFile.list.find((item) => item === persona) || !fileId);
                    const index = listFile.list.findIndex((item) => item === persona);
                    listFile.list.splice(index, 1);
                    listFile.date_updated = new Date().toISOString();
                    storage.write(listFile);
                } else {
                    return;
                }
            });
        });
    },
};
