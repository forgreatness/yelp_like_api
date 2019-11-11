module.exports = {
    validateAgainstSchema: (obj, schema) => {
        return obj && Object.keys(schema).every(
            field => !schema[field].required || typeof obj[field] !== 'undefined'
        );
    },

    extractValidFields: (obj, schema) => {
        let validObj = {};
        Object.keys(schema).forEach((field) => {
            if (typeof obj[field] !== 'undefined') {
                validObj[field] = obj[field];
            }
        });
        return validObj;
    }
};