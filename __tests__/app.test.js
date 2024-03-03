const db = require(`${__dirname}/../db/connection`);
const seed = require(`${__dirname}/../db/seeds/seed`);
const testData = require(`${__dirname}/../db/data/test-data/`);
const request = require("supertest");
const app = require(`${__dirname}/../app`);
const fs = require("fs/promises");

// Seed database with test data before each test.
beforeEach(() => {
    return seed(testData);
});

// End database connection after all tests have run.
afterAll(() => {
    return db.end();
});

describe("GET /api/topics", () => {
    test("status: 200, returns an array of topic objects", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.topics)).toBe(true);
                expect(body.topics).toHaveLength(3);
                body.topics.forEach((topic) => {
                    expect(topic).toHaveProperty("slug");
                    expect(topic).toHaveProperty("description");
                });
            });
    });
});
describe("GET /api", () => {
    test("status: 200, returns an object describing all available endpoints", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body }) => {
                fs.readFile(`${__dirname}/../endpoints.json`, "utf-8").then(
                    (expectedObject) => {
                        expect(body.endpoints).toEqual(
                            JSON.parse(expectedObject)
                        );
                    }
                );
            });
    });
});

describe("GET /api/articles/:article_id", () => {
    test("status: 200, returns correct article object from given article_id parameter", () => {
        const givenParameter = 3;

        return request(app)
            .get(`/api/articles/${givenParameter}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.article).toHaveProperty(
                    "article_id",
                    givenParameter // checks the recieved article_id is the given parameter.
                );
                expect(typeof body.article.author).toBe("string");
                expect(typeof body.article.title).toBe("string");
                expect(typeof body.article.body).toBe("string");
                expect(typeof body.article.topic).toBe("string");
                expect(typeof body.article.created_at).toBe("string");
                expect(typeof body.article.votes).toBe("number");
                expect(typeof body.article.article_img_url).toBe("string");
                expect(typeof body.article.comment_count).toBe("number");
            });
    });
    test("status: 400, returns status error and msg if given parameter is not a number", () => {
        const notANumber = "string";
        return request(app)
            .get(`/api/articles/${notANumber}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: bad request");
            });
    });
    test("status: 404, returns status error and msg if given parameter does not equal an article_id in the database", () => {
        const nonExistantArticleId = 543;
        return request(app)
            .get(`/api/articles/${nonExistantArticleId}`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`ERROR: article does not exist`);
            });
    });
});

describe("GET /api/articles", () => {
    test("status: 200, returns an array of all article objects orderd by date", () => {
        const ignorePagination = "?limit=null";
        return request(app)
            .get(`/api/articles${ignorePagination}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles.length).toBe(13);
                expect(body.articles).toBeSortedBy("created_at", {
                    descending: true,
                });
                body.articles.forEach((article) => {
                    expect(article).toHaveProperty("author");
                    expect(article).toHaveProperty("title");
                    expect(article).toHaveProperty("article_id");
                    expect(article).toHaveProperty("topic");
                    expect(article).toHaveProperty("created_at");
                    expect(article).toHaveProperty("votes");
                    expect(article).toHaveProperty("article_img_url");
                    expect(article).toHaveProperty("comment_count");
                    expect(article).not.toHaveProperty("body");
                });
            });
    });
});

describe("GET /api/articles/:article_id/comments", () => {
    test("status: 200, returns array of comments for given article_id parameter", () => {
        const givenParameter = 3;
        const numOfCommentsForParameter = 2;

        return request(app)
            .get(`/api/articles/${givenParameter}/comments`)
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.comments)).toBe(true);
                expect(body.comments).toHaveLength(numOfCommentsForParameter);
                body.comments.forEach((comment) => {
                    expect(typeof comment.comment_id).toBe("number");
                    expect(typeof comment.votes).toBe("number");
                    expect(typeof comment.created_at).toBe("string");
                    expect(typeof comment.author).toBe("string");
                    expect(typeof comment.body).toBe("string");
                    expect(typeof comment.article_id).toBe("number");
                });
            });
    });
    test("returned comments should be served in order of most recent", () => {
        const article_id = 1;

        return request(app)
            .get(`/api/articles/${article_id}/comments`)
            .then(({ body }) => {
                expect(body.comments).toBeSortedBy("created_at", {
                    descending: true,
                });
            });
    });
    test("status: 200, returns an empty array if there are no comments for a given article", () => {
        const articleWithNoComments = 2;

        return request(app)
            .get(`/api/articles/${articleWithNoComments}/comments`)
            .expect(200)
            .then(({ body }) => {
                expect(body.comments).toEqual([]);
            });
    });
    test("status: 400, returns an error status and msg if given article_id is not a number", () => {
        const notANumber = "string";

        return request(app)
            .get(`/api/articles/${notANumber}/comments`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: bad request");
            });
    });
    test("status: 404, returns error status and msg if given article_id is not in database", () => {
        const nonExistantId = 543;

        return request(app)
            .get(`/api/articles/${nonExistantId}/comments`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`ERROR: article does not exist`);
            });
    });
});

describe("POST /api/articles/:article_id/comments", () => {
    test("status: 201, adds new post to database and returns posted object", () => {
        const articleId = 2;
        const postReq = {
            username: "lurker",
            body: "I agree with this article.",
        };

        return request(app)
            .post(`/api/articles/${articleId}/comments`)
            .send(postReq)
            .expect(201)
            .then(({ body }) => {
                // Check returned POST data is what we expect
                expect(body.comment.comment_id).toBe(19);
                expect(body.comment.body).toBe(postReq.body);
                expect(body.comment.article_id).toBe(articleId);
                expect(body.comment.author).toBe(postReq.username);
                expect(body.comment.votes).toBe(0);
                expect(typeof body.comment.created_at).toBe("string");
                return body;
            })
            .then((body) => {
                // Check returned POST data has been added to database
                return db
                    .query(`SELECT * FROM comments where comment_id = 19`)
                    .then(({ rows }) => {
                        const inDatabase = rows[0];
                        const fromRequest = body.comment;

                        expect(fromRequest.comment_id).toBe(
                            inDatabase.comment_id
                        );
                        expect(fromRequest.body).toBe(inDatabase.body);
                        expect(fromRequest.article_id).toBe(
                            inDatabase.article_id
                        );
                        expect(fromRequest.author).toBe(inDatabase.author);
                        expect(fromRequest.votes).toBe(inDatabase.votes);

                        // As *created_at* is stored in the database as a date variable
                        // converting data to Date format is required for
                        // accurate comparison
                        expect(Date(fromRequest.created_at)).toBe(
                            Date(inDatabase.created_at)
                        );
                    });
            });
    });
    test("status: 400, returns an error and status msg if given article_id is not a number", () => {
        const notANumber = "string";
        const postReq = {
            username: "lurker",
            body: "Article does not exist.",
        };

        return request(app)
            .post(`/api/articles/${notANumber}/comments`)
            .send(postReq)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: bad request");
            });
    });
    test("status: 404, returns an error status and msg if given article_id is not in database", () => {
        const nonExistantArticleId = 543;
        const postReq = {
            username: "lurker",
            body: "Article does not exist.",
        };

        return request(app)
            .post(`/api/articles/${nonExistantArticleId}/comments`)
            .send(postReq)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`ERROR: article does not exist`);
            });
    });
});

describe("PATCH /api/articles/:article_id", () => {
    test("status: 200, increased vote count returned in updated article object", () => {
        const article_id = 3;
        const voteUpdate = { inc_votes: 5 };

        return request(app)
            .patch(`/api/articles/${article_id}`)
            .send(voteUpdate)
            .expect(200)
            .then(({ body }) => {
                expect(body.article.article_id).toBe(article_id);
                expect(typeof body.article.title).toBe("string");
                expect(typeof body.article.topic).toBe("string");
                expect(typeof body.article.author).toBe("string");
                expect(typeof body.article.body).toBe("string");
                expect(typeof body.article.created_at).toBe("string");
                expect(typeof body.article.article_img_url).toBe("string");
                expect(typeof body.article.comment_count).toBe("number");
                expect(body.article.votes).toBe(voteUpdate.inc_votes);
            });
    });
    test("status: 200, decreases vote count in database when given negative amount and returns updated article object", () => {
        const article_id = 1;
        const negativeVotes = -3;
        const voteUpdate = { inc_votes: negativeVotes };

        // querying database before patch request
        return db
            .query(`SELECT votes FROM articles WHERE article_id = $1`, [
                article_id,
            ])
            .then((data) => {
                // initial vote count in databse before PATCH request
                const initialVotes = data.rows[0].votes;
                return initialVotes;
            })

            .then((initialVotes) => {
                // PATCH request
                return request(app)
                    .patch(`/api/articles/${article_id}`)
                    .send(voteUpdate)
                    .expect(200)
                    .then(({ body }) => {
                        expect(body.article.article_id).toBe(article_id);
                        expect(typeof body.article.title).toBe("string");
                        expect(typeof body.article.topic).toBe("string");
                        expect(typeof body.article.author).toBe("string");
                        expect(typeof body.article.body).toBe("string");
                        expect(typeof body.article.created_at).toBe("string");
                        expect(typeof body.article.article_img_url).toBe(
                            "string"
                        );
                        expect(typeof body.article.comment_count).toBe(
                            "number"
                        );

                        // expect votes to be initial votes plus the negative votes patch update
                        expect(body.article.votes).toBe(
                            initialVotes + negativeVotes
                        );
                    });
            });
    });
    test("status: 400, returns an error status and msg if given article_id is not a number", () => {
        const notANumber = "string";
        const voteUpdate = { inc_votes: 5 };

        return request(app)
            .patch(`/api/articles/${notANumber}`)
            .send(voteUpdate)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: bad request");
            });
    });
    test("status: 400, returns an error status and msg if given vote update is not a valid number", () => {
        const article_id = 1;
        const notANumber = "string";
        const voteUpdate = { inc_votes: notANumber };

        return request(app)
            .patch(`/api/articles/${article_id}`)
            .send(voteUpdate)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: bad request");
            });
    });
    test("status: 400, returns error status and msg if PATCH body in wrong format (does not include inc_vote key)", () => {
        const article_id = 1;
        const invalidVote = { votes: 4 }; // valid key is inc_votes

        return request(app)
            .patch(`/api/articles/${article_id}`)
            .send(invalidVote)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: bad request");
            });
    });
    test("status: 404, returns an error status and msg if given article_id is not in database", () => {
        const nonExistantArticleId = 543;
        const voteUpdate = { inc_votes: 3 };

        return request(app)
            .patch(`/api/articles/${nonExistantArticleId}`)
            .send(voteUpdate)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`ERROR: article does not exist`);
            });
    });
});

describe("DELETE /api/comments/:comment_id", () => {
    test("status: 204, deletes a given comment returning no content", () => {
        const comment_id = 4;

        return request(app)
            .delete(`/api/comments/${comment_id}`)
            .expect(204)
            .then(({ body }) => {
                expect(body).toEqual({});
                return db
                    .query("SELECT * FROM comments WHERE comment_id = $1", [
                        comment_id,
                    ])
                    .then(({ rows }) => {
                        expect(rows).toHaveLength(0);
                    });
            });
    });
    test("status: 400, returns an error status and msg if given comment_id is not a number", () => {
        const notANumber = "string";

        return request(app)
            .delete(`/api/comments/${notANumber}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: bad request");
            });
    });
    test("status: 404, returns an error status and msg if given comment_id is not in database", () => {
        const nonExistantCommentId = 543;

        return request(app)
            .delete(`/api/comments/${nonExistantCommentId}`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: comment does not exist");
            });
    });
});

describe("GET /api/users", () => {
    test("status: 200, returns an array of all user objects", () => {
        return request(app)
            .get(`/api/users`)
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.users)).toBe(true);
                expect(body.users).toHaveLength(4);
                body.users.forEach((user) => {
                    expect(typeof user.username).toBe("string");
                    expect(typeof user.name).toBe("string");
                    expect(typeof user.avatar_url).toBe("string");
                });
            });
    });
});

describe("FEATURE (query article by topic): GET /api/articles?topic=", () => {
    test("status: 200, returns an array of all articles with given topic", () => {
        const topic = "mitch";
        const numbOfArticlesWithTopic = 12;
        const ignorePagination = "limit=null";
        return request(app)
            .get(`/api/articles?topic=${topic}&${ignorePagination}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toHaveLength(numbOfArticlesWithTopic);
                body.articles.forEach((article) => {
                    expect(typeof article.author).toBe("string");
                    expect(typeof article.title).toBe("string");
                    expect(typeof article.article_id).toBe("number");
                    expect(typeof article.topic).toBe("string");
                    expect(typeof article.created_at).toBe("string");
                    expect(typeof article.votes).toBe("number");
                    expect(typeof article.article_img_url).toBe("string");
                    expect(typeof article.comment_count).toBe("number");
                });
            });
    });
    test("status: 200, returns an empty array for a topic which exists but has no articles", () => {
        const validTopicWithNoArticles = "paper";
        const emptyArray = [];
        return request(app)
            .get(`/api/articles?topic=${validTopicWithNoArticles}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toEqual(emptyArray);
            });
    });
    test("status: 404, reuturns an error status and msg if topic does not exist", () => {
        const nonExiststantTopic = "forklifts";
        return request(app)
            .get(`/api/articles?topic=${nonExiststantTopic}`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: topic does not exist");
            });
    });
});

describe("FEATURE (sorting queries): GET /api/articles?sort_by=&order=", () => {
    test("status: 200, sorts articles by any valid column if given valid sort_by query and defaults to descending order", () => {
        const validColumn = "comment_count";
        return request(app)
            .get(`/api/articles?sort_by=${validColumn}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeSortedBy(validColumn, {
                    descending: true,
                });
            });
    });
    test("status: 200, returns articles in ascending order when passed valid ascending order query", () => {
        const ascOrderQuery = "?order=asc";
        return request(app)
            .get(`/api/articles${ascOrderQuery}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeSortedBy("created_at", {
                    descending: false,
                });
            });
    });
    test("status: 200, returns articles in descending order when passed valid descending order query", () => {
        const descOrderQuery = "?order=desc";
        return request(app)
            .get(`/api/articles${descOrderQuery}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeSortedBy("created_at", {
                    descending: true,
                });
            });
    });
    test("status: 200, can return articles in ascending order sorted by a valid column", () => {
        const validSortQuery = "sort_by=author";
        const ascOrderQuery = "order=asc";
        return request(app)
            .get(`/api/articles?${validSortQuery}&${ascOrderQuery}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toBeSortedBy("author", {
                    descending: false,
                });
            });
    });
    test("status: 400, returns an error status and msg if sort_by query is not a valid column in the database", () => {
        const nonValidColumn = "forklift_count";
        return request(app)
            .get(`/api/articles?sort_by=${nonValidColumn}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: invalid sort query");
            });
    });
    test("status: 400, returns an error status and msg if order by query is invalid", () => {
        const nonValidOrderQuery = "ascending"; // valid order query is asc (or ASC)
        return request(app)
            .get(`/api/articles?order=${nonValidOrderQuery}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: invalid order query");
            });
    });
});

describe("FEATURE (pagination: GET /api/articles", () => {
    test("status: 200, limits object responses amount to given limit and returns total number of overall objects", () => {
        const limit = 3;
        return request(app)
            .get(`/api/articles?limit=${limit}`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toHaveLength(limit);
                expect(body.total_count).toBe(13);
            });
    });
    test("status: 200, defaults to limiting to 10 items if not passed a limit query", () => {
        return request(app)
            .get(`/api/articles`)
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toHaveLength(10);
            });
    });
    test("status: 200, passed ?p= query determines which 'page' to start at", () => {
        const limitQuery = 5;
        const pageToStartAt = 2;
        const sortBy = "article_id";
        return request(app)
            .get(
                `/api/articles?sort_by=${sortBy}&order=asc&limit=${limitQuery}&p=${pageToStartAt}`
            )
            .expect(200)
            .then(({ body }) => {
                expect(body.articles).toHaveLength(5);
                expect(body.articles[0]).toHaveProperty("article_id", 6);
                expect(body.articles[1]).toHaveProperty("article_id", 7);
                expect(body.articles[2]).toHaveProperty("article_id", 8);
                expect(body.articles[3]).toHaveProperty("article_id", 9);
                expect(body.articles[4]).toHaveProperty("article_id", 10);
                expect(body.total_count).toBe(13);
            });
    });
    test("status: 400, returns an error status and msg if p query is too high for viable amount of pages based on limiter", () => {
        const invalidPQuery = 4;
        const limit = 5;
        const sortBy = "article_id";
        return request(app)
            .get(
                `/api/articles?sort_by=${sortBy}&order=asc&limit=${limit}&p=${invalidPQuery}`
            )
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: invalid p query");
            });
    });
    test("status: 400, returns an error status and msg if p query in not a number", () => {
        const notANumber = "string";
        const limit = 5;
        const sortBy = "article_id";
        return request(app)
            .get(
                `/api/articles?sort_by=${sortBy}&order=asc&limit=${limit}&p=${notANumber}`
            )
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: invalid p query");
            });
    });
    test("status: 400, returns an error status and msg if limit is not a number", () => {
        const notANumber = "string";
        return request(app)
            .get(`/api/articles?limit=${notANumber}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: invalid limit query");
            });
    });
    test("status: 400, returns an error status and msg if limit is a negative number", () => {
        const negativeumber = -5;
        return request(app)
            .get(`/api/articles?limit=${negativeumber}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("ERROR: invalid limit query");
            });
    });
});

describe("GET /api/users:username", () => {
    test("status: 200, returns a user object by username", () => {
        const username = "rogersop"
        const userObj = {
            username: "rogersop",
            name: "paul",
            avatar_url:
                "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
        };
        return request(app)
    .get(`/api/users/${username}`)
    .expect(200)
    .then(({body}) => {
        expect(body.user).toEqual(userObj);
    })
    });
    test("status: 404, returns an error status and msg if given username is not in database", () => {
        const notAUsername = 'notInDatabase';
        return request(app)
        .get(`/api/users/${notAUsername}`)
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe('ERROR: username does not exist')
        })
    })
});
