export default {
    removeNotSignProperties(obj: any) {
        obj = JSON.parse(JSON.stringify(obj));
        for (let key in obj) {
            if (key[0] === '@' || key === 'signature') {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                this.removeNotSignProperties(obj[key]);
            }
        }
        return obj;
    },
};
