import check from './check';
import config from '../config';
import storage from './storage';
import id from './id';

export default {
    add: async (item: RSS3Item) => {
        if (item.upstream) {
            const parsed = check.parseId(item.upstream);
            let fileId =
                parsed.persona +
                '-items-' +
                Math.ceil(parsed.index / config.itemPageSize);
            if (!(await storage.exist(fileId))) {
                fileId = parsed.persona;
                if (!(await storage.exist(fileId))) {
                    return false;
                }
            }
            const up = <RSS3Content>JSON.parse(await storage.read(fileId));
            let list: RSS3List;
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
            const listId = `${parsed.persona}-context@${item.type}-${parsed.index}`;
            const now = new Date().toISOString();
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
};
