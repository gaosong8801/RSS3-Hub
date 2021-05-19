import { is } from 'typescript-is';

export default function (body: any): {
    tags: string[];
    list: Address[];
    error: string;
} {
    let error = '';

    let tags: string[];
    try {
        if (body.tags) {
            tags = JSON.parse(body.tags);
            if (!is<string[]>(tags)) {
                throw new Error();
            }
        }
    } catch (error) {
        error += 'tags ';
    }

    let list: Address[];
    try {
        if (body.list) {
            list = JSON.parse(body.list);
            if (!is<Address[]>(list)) {
                throw new Error();
            }
        }
    } catch (error) {
        error += 'list ';
    }

    return {
        tags,
        list,
        error,
    };
}
