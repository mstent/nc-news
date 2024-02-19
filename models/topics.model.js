const db = require(`${__dirname}/../db/connection`)

exports.selectTopics = () => {
    return db.query('SELECT * FROM topics')
    .then((dataQuery) => {
        return {topics: dataQuery.rows};
    })
}