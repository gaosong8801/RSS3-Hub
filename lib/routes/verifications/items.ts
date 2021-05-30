import { is } from 'typescript-is';

export default function (body: any): {
    authors: Address[];
    tags: string[];
    contents: RSS3ItemContents[];
    error: string;
} {
    let error = '';

    let authors: Address[];
    try {
        if (body.authors) {
            authors = JSON.parse(body.authors);
            if (!is<Address[]>(authors)) {
                throw new Error();
            }
        }
    } catch (error) {
        error += 'authors ';
    }

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

    let contents: RSS3ItemContents[];
    try {
        if (body.contents) {
            contents = JSON.parse(body.contents);
            if (!is<RSS3ItemContents[]>(contents)) {
                throw new Error();
            }
        }
    } catch (error) {
        error += 'contents ';
    }

    return {
        authors,
        tags,
        contents,
        error,
    };
}
