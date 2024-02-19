const db = require(`${__dirname}/../db/connection`);
const seed = require(`${__dirname}/../db/seeds/seed`);
const testData = require(`${__dirname}/../db/data/test-data/`);
const request = require("supertest");
const app = require(`${__dirname}/../app`);

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