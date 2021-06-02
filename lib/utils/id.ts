function parse(id: string) {
    const splited = id.split('-');
    return {
        persona: splited[0],
        type: splited[1],
        index: parseInt(splited[2]),
    };
}

export default {
    parse,

    addIndex: (id: string) => {
        const parsed = parse(id);
        return `${parsed.persona}-${parsed.type}-${parsed.index + 1}`;
    },
};
