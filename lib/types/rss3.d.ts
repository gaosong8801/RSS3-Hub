type Address = string;

// Common attributes for each file
interface RSS3Base {
    id: Address;
    version: 'rss3.io/version/v0.1.0';
    type: string;
    date_created: string;
    date_updated: string;
    items: any[];
    items_next?: Address; // T
}

// Entrance, RSS3Persona file
interface RSS3Persona extends RSS3Base {
    type: 'persona';

    profile: {
        name?: string;
        avatar?: Address; // Link to a third party file
        bio?: string;
		tags?: string[];
    };

    links: {
        id: string;
        name: string;
        tags?: string[];
        list: Address[];
    }[];

    items: RSS3Item[];

    assets: {
        id: string;
        name: string;
        tags?: string[];
        list: string[];
    }[];
}

// RSS3Items file
interface RSS3Items extends RSS3Base {
    type: 'items';
    items: RSS3Item[];
}

interface RSS3ItemContents {
    id: Address; // Link to a third party file
    mime_type: string;
    name?: string;
    tags?: string[];
    size_in_bytes?: string;
    duration_in_seconds?: string;
}

interface RSS3Item {
    id: string;
    authors?: Address[];
    title?: string;
    summary?: string;
    tags?: string[];
    date_published?: string;
    date_modified?: string;

    contents?: RSS3ItemContents[];
}
