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
                expect(body.article).toHaveProperty("author");
                expect(body.article).toHaveProperty("title");
                expect(body.article).toHaveProperty("body");
                expect(body.article).toHaveProperty("topic");
                expect(body.article).toHaveProperty("created_at");
                expect(body.article).toHaveProperty("votes");
                expect(body.article).toHaveProperty("article_img_url");
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
                expect(body.msg).toBe(
                    `ERROR: article *${nonExistantArticleId}* does not exist`
                );
            });
    });
});

describe("GET /api/articles", () => {
    test("status: 200, returns an array of all article objects orderd by date", () => {
        return request(app)
            .get("/api/articles")
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
    test("status: 404, returns error status and msg if given article_id is not in database", () => {
        const nonExistantId = 543;

        return request(app)
            .get(`/api/articles/${nonExistantId}/comments`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(
                    `ERROR: article *${nonExistantId}* does not exist`
                );
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
});
