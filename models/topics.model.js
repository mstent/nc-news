const db = require(`${__dirname}/../db/connection`);

const selectTopics = async () => {
    return db.query("SELECT * FROM topics").then((dataQuery) => {
        return { topics: dataQuery.rows };
    });
};

const inTopicList = async (topic) => {
    if (topic === undefined) {
        return Promise.resolve;
    }
    return selectTopics().then(({ topics }) => {
        const availableTopics = topics.map((availableTopic) => {
            return availableTopic.slug;
        });
        if (availableTopics.includes(topic)) {
            return Promise.resolve;
        } else {
            return Promise.reject({
                status: 404,
                msg: "ERROR: topic does not exist",
            });
        }
    });
};

module.exports = { selectTopics, inTopicList };
