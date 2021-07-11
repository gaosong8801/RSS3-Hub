function parse(id: string) {
    const splited = id.split('-');
    return {
        persona: splited[0],
        type: splited[1] || 'index',
        index: splited[2] !== undefined ? parseInt(splited[2]) : Infinity,
    };
}

export default {
    parse,

    addIndex: (id: string, next: string) => {
        if (next) {
            const parsed = parse(next);
            return `${parsed.persona}-${parsed.type}-${parsed.index + 1}`;
        } else {
            return `${id}-0`;
        }
    },
};
