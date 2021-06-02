import config from '../config';
import storage from './storage';
import id from './id';

export default {
    add: async (item: RSS3Item) => {
        if (item.upstream) {
            const parsed = id.parse(item.upstream);
            let fileId =
                parsed.persona +
                '-items-' +
                Math.ceil(parsed.index / config.itemPageSize);
            const listId = `${parsed.persona}-context@${parsed.index}@${item.type}`;

            if (!(await storage.exist(fileId))) {
                fileId = parsed.persona;
                if (!(await storage.exist(fileId))) {
                    return false;
                }
            }
            const up = <RSS3Content>JSON.parse(await storage.read(fileId));
            const upItem = up.items.find((i) => i.id === item.id);
            if (!upItem) {
                return false;
            }
            if (!upItem['@contexts']) {
                upItem['@contexts'] = [];
            }
            let context = upItem['@contexts'].find(
                (context) => context.type === item.type,
            );
            const now = new Date().toISOString();
            let list: RSS3List;

            if (!context) {
                context = {
                    type: item.type,
                    list: listId,
                };
                upItem['@contexts'].push(context);
                list = {
                    id: listId,
                    '@version': 'rss3.io/version/v0.1.0',
                    date_updated: now,
                    date_created: now,

                    list: [item.id],
                };
                storage.write(fileId, JSON.stringify(up));
                storage.write(listId, JSON.stringify(list));
            } else {
                list = JSON.parse(await storage.read(listId));

                if (list.list.length >= config.listPageSize) {
                    const newListId = id.addIndex(listId);
                    storage.write(
                        newListId,
                        JSON.stringify(<RSS3List>{
                            id: newListId,
                            '@version': 'rss3.io/version/v0.1.0',
                            date_updated: now,
                            date_created: now,

                            list: list.list,
                        }),
                    );
                    list.list = [item.id];
                    list.date_updated = now;
                    storage.write(listId, JSON.stringify(list));
                } else {
                    list.list.push(item.id);
                    list.date_updated = now;

                    storage.write(listId, JSON.stringify(list));
                }
            }
        }
    },

    remove: async (item: RSS3Item) => {
        if (item.upstream) {
            const parsed = id.parse(item.upstream);
            let listId = `${parsed.persona}-context@${parsed.index}@${item.type}`;
            const now = new Date().toISOString();

            if (!(await storage.exist(listId))) {
                return false;
            } else {
                let list: RSS3List;
                let index;
                do {
                    list = JSON.parse(await storage.read(listId));
                    index = list.list
                        ? list.list.findIndex((i) => i === item.id)
                        : -1;
                    listId = list.list_next;
                } while (index !== -1 || !listId);
                if (index === -1) {
                    return false;
                }
                list.list.splice(index, 1);
                list.date_updated = now;
                storage.write(list.id, JSON.stringify(list));
            }
        }
    },
};
