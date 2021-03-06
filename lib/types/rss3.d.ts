type RSS3ID = string;
type RSS3ItemID = string;
type RSS3ItemsID = string;
type RSS3ListID = string;
type ThirdPartyAddress = string[];

type RSS3IContent = RSS3Index | RSS3Items;
type RSS3Content = RSS3IContent | RSS3List;

// Common attributes for each files
interface RSS3Base {
    id: RSS3ID | RSS3ItemsID | RSS3ListID;
    '@version': string;
    date_created: string;
    date_updated: string;
}

// Entrance, RSS3 file
interface RSS3Index extends RSS3Base {
    id: RSS3ID;
    signature: string;

    profile?: RSS3Profile;

    items?: RSS3Item[];
    items_next?: RSS3ItemsID;

    links?: RSS3Links[];
    '@backlinks'?: {
        type: string;
        list: RSS3ListID;
    }[];

    assets?: {
        type: string;
        tags?: string[];
        content: string;
    }[];
}

// RSS3Items file
interface RSS3Items extends RSS3Base {
    id: RSS3ItemsID;
    signature: string;

    items: RSS3Item[];
    items_next?: RSS3ItemsID;
}

// RSS3List file
interface RSS3List extends RSS3Base {
    id: RSS3ListID;

    list?: RSS3ID[] | RSS3ItemID[];
    list_next?: RSS3ListID;
}

interface RSS3Item {
    id: RSS3ItemID;
    authors?: RSS3ID[];
    title?: string;
    summary?: string;
    tags?: string[];
    date_published?: string;
    date_modified?: string;

    type?: string;
    upstream?: RSS3ItemID;

    contents?: {
        address: ThirdPartyAddress;
        mime_type: string;
        name?: string;
        tags?: string[];
        size_in_bytes?: string;
        duration_in_seconds?: string;
    }[];

    '@contexts'?: {
        type?: string;
        list: RSS3ListID;
    }[];

    signature: string;
}

interface RSS3Profile {
    name?: string;
    avatar?: ThirdPartyAddress;
    bio?: string;
    tags?: string[];
    signature: string;
}

interface RSS3LinksInput {
    type: string;
    tags?: string[];
    list?: RSS3ID[];
}

interface RSS3Links extends RSS3LinksInput {
    signature: string;
}
