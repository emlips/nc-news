const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api", () => {
  test("GET:200 responds with an object describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        for (const key in endpoints) {
          expect(endpoints[key]).toHaveProperty("description");
          expect(endpoints[key]).toHaveProperty("queries");
          expect(endpoints[key]).toHaveProperty("reqBodyFormat");
          expect(endpoints[key]).toHaveProperty("exampleResponse");
        }
      });
  });
});

describe("GET /api/topics", () => {
  test("GET:200 responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("GET:200 responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          if (article.article_id === 1) {
            expect(article.comment_count).toBe(11);
          }
        });
      });
  });
  test("GET:200 responds with articles in descending date order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("GET:200 responds with articles with comment_count properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        articles.forEach((article) => {
          expect(article).toHaveProperty("comment_count");
          if (article.article_id === 1) {
            expect(article.comment_count).toBe(11);
          }
        });
      });
  });
  test("GET:200 takes a topic query that returns only the articles on the given topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch&limit=13")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("GET:200 returns an empty array when given topic query exists, but has no associated articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
  test("GET:200 responds with articles sorted by the given column when a sort_by query is received, with default order descending", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });
  test("GET:200 responds with articles sorted in ascending order of the given sort_by value, when an order=asc query is chained", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
        expect(articles).toBeSortedBy("title");
      });
  });
  test("GET:200 responds with the number of articles requested by the limit query", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(5);
      });
  });
  test("GET:200 responds with 10 articles as default when no limit query received", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(10);
      });
  });
  test("GET:200 responds with a total_count property of 10 when no query is received", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.total_count).toBe(10);
      });
  });
  test("GET:200 responds with a total_count property of actual articles received, even where total_count is lower than the limit", () => {
    return request(app)
      .get("/api/articles?topic=cats&limit=8")
      .expect(200)
      .then(({ body }) => {
        expect(body.total_count).toBe(1);
      });
  });
  test("GET:200 responds with the specified page requested in the query", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&limit=2&p=4")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles[0].article_id).toBe(7);
        expect(articles[1].article_id).toBe(8);
      });
  });
  test("GET:200 responds with empty array when specified page requested in the query is beyond the retrieval of results", () => {
    return request(app)
      .get("/api/articles?limit=20&p=4")
      .expect(200)
      .then(({ body }) => {
        const { articles, total_count } = body;
        expect(articles).toEqual([]);
        expect(total_count).toBe(0);
      });
  });
  test("GET:404 returns an error when a valid but non-existent topic is received in the query", () => {
    return request(app)
      .get("/api/articles?topic=dogs")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("topic not found");
      });
  });
  test("GET:400 returns an error when a non-existent sort_by value is received", () => {
    return request(app)
      .get("/api/articles?sort_by=word_count")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when the sort_by value is not strictly a column name, to avoid SQL injection", () => {
    return request(app)
      .get("/api/articles?sort_by=author;")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when the given order value is not asc or desc", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=notAsc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when an invalid limit query value is received", () => {
    return request(app)
      .get("/api/articles?limit=notANumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when limit is not strictly a number to avoid SQL injection", () => {
    return request(app)
      .get("/api/articles?limit=5;")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when an invalid p query value is received", () => {
    return request(app)
      .get("/api/articles?p=notANumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when p is not strictly a number to avoid SQL injection", () => {
    return request(app)
      .get("/api/articles?p=2;")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("POST:201 responds with newly posted article", () => {
    const newArticle = {
      author: "lurker",
      title: "newTitle",
      body: "newBody",
      topic: "cats",
      article_img_url: "newURL",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          author: "lurker",
          title: "newTitle",
          body: "newBody",
          topic: "cats",
          article_img_url: "newURL",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
  });
  test("POST:201 responds with newly created article with default article_img_url when no value is received in the request", () => {
    const newArticle = {
      author: "lurker",
      title: "newTitle",
      body: "newBody",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        const { article } = body;
        expect(article.article_img_url).toBe(
          "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
        );
      });
  });
  test("POST:400 returns an error message when topic fails the schema topic reference validation", () => {
    const newArticle = {
      author: "lurker",
      title: "newTitle",
      body: "newBody",
      topic: "dogs",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("POST:400 returns an error message when author fails the schema username reference validation", () => {
    const newArticle = {
      author: "newAuthor",
      title: "newTitle",
      body: "newBody",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("POST:400 returns an error when body is malformed/missing required fields", () => {
    const newArticle = {
      author: "lurker",
      title: "newTitle",
      body: "newBody",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("GET:200 responds with an article object relating to the correct article_id", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "2020-11-03T09:12:00.000Z",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          votes: 0,
        });
      });
  });
  test("GET:200 responds with an article with comment_count property", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("comment_count");
        expect(article.comment_count).toBe(11);
      });
  });
  test("GET:200 responds with an article with comment_count property with value 0 when no comments are associated with the article", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("comment_count");
        expect(article.comment_count).toBe(0);
      });
  });
  test("GET:404 returns an error when a valid but non-existent id is received", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article does not exist");
      });
  });
  test("GET:400 returns an error when an invalid id is received", () => {
    return request(app)
      .get("/api/articles/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("GET:200 responds with an array of comments relating to the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=20")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(11);
        comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.article_id).toBe("number");
        });
      });
  });
  test("GET:200 responds with comments ordered by most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=20")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(11);
        expect(comments).toBeSortedBy("created_at");
      });
  });
  test("GET:200 responds with an empty array where the given article_id exists but has no associated comments", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
  test("GET:200 responds with the number of comments requested in the limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(5);
      });
  });
  test("GET:200 responds with 10 comments per page as default when no limit query received", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(10);
      });
  });
  test("GET:200 responds with the specified page requested in the query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=2&p=3")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(2);
        expect(comments[0].comment_id).toBe(6);
        expect(comments[1].comment_id).toBe(8);
      });
  });
  test("GET:200 responds with empty array when specified page requested in the query is beyond the retrieval of results", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=20&p=4")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
  test("GET:404 returns an error when a valid but non-existent id is received", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article does not exist");
      });
  });
  test("GET:400 returns an error when an invalid id is received", () => {
    return request(app)
      .get("/api/articles/notAnId/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when an invalid limit query value is received", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=notANumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when limit is not strictly a number to avoid SQL injection", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5;")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when an invalid p query value is received", () => {
    return request(app)
      .get("/api/articles/1/comments?p=notANumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("GET:400 returns an error when p is not strictly a number to avoid SQL injection", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=3&p=2;")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST:201 responds with the posted comment", () => {
    const newPost = {
      username: "rogersop",
      body: "new comment posted",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newPost)
      .expect(201)
      .then(({ body }) => {
        const { newComment } = body;
        expect(newComment).toBe("new comment posted");
      });
  });
  test("POST:400 returns an error when body is malformed/missing required fields", () => {
    const newPost = {
      username: "rogersop",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newPost)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("POST:400 returns an error message when username fails the schema references validation", () => {
    const newPost = {
      username: "testUser",
      body: "new comment posted",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newPost)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("POST:400 returns an error when request body is valid, but a valid but non-existent article_id is received", () => {
    const newPost = {
      username: "rogersop",
      body: "new comment posted",
    };
    return request(app)
      .post("/api/articles/999999/comments")
      .send(newPost)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("POST:400 returns an error when request body is valid, but an invalid id is received", () => {
    const newPost = {
      username: "rogersop",
      body: "new comment posted",
    };
    return request(app)
      .post("/api/articles/notAnId/comments")
      .send(newPost)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH:200 responds with the updated article", () => {
    const update = { inc_votes: 10 };
    return request(app)
      .patch("/api/articles/1")
      .send(update)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.votes).toBe(110);
      });
  });
  test("PATCH:200 responds negative vote count when the update results in negative votes", () => {
    const update = { inc_votes: -1 };
    return request(app)
      .patch("/api/articles/2")
      .send(update)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.votes).toBe(-1);
      });
  });
  test("PATCH:400 returns an error when body is malformed/missing required fields", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("PATCH:400 returns an error when inc_votes is of invalid type", () => {
    const update = { inc_votes: "a string" };
    return request(app)
      .patch("/api/articles/1")
      .send(update)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("PATCH:404 returns an error when request body is valid, but a valid but non-existent article_id is received", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/99999")
      .send(update)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article does not exist");
      });
  });
  test("PATCH:400 returns an error when request body is valid, but an invalid article_id is received", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/notAnId")
      .send(update)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE:204 deletes the specified comment and responds with no body", () => {
    return request(app).delete("/api/comments/2").expect(204);
  });
  test("DELETE:404 returns an error when a valid but non-existent comment_id is received", () => {
    return request(app)
      .delete("/api/comments/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("comment not found");
      });
  });
  test("DELETE:400 returns an error when an invalid comment_id is received", () => {
    return request(app)
      .delete("/api/comments/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("PATCH:200 responds with the updated comment", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment.comment_id).toBe(2);
        expect(comment.votes).toBe(15);
      });
  });
  test("PATCH:200 responds negative vote count when the update results in negative votes", () => {
    return request(app)
      .patch("/api/comments/5")
      .send({ inc_votes: -3 })
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment.comment_id).toBe(5);
        expect(comment.votes).toBe(-3);
      });
  });
  test("PATCH:400 returns an error when body is malformed/missing required fields", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ votes: 3 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("PATCH:400 returns an error when inc_votes is of invalid type", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: "notANumber" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("PATCH:404 returns an error when request body is valid, but a valid but non-existent comment_id is received", () => {
    return request(app)
      .patch("/api/comments/999999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("comment does not exist");
      });
  });
  test("PATCH:400 returns an error when request body is valid, but an invalid comment_id is received", () => {
    return request(app)
      .patch("/api/comments/notAnId")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("GET:200 responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("GET:200 responds with a user object relating to the correct username", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toMatchObject({
          username: "lurker",
          name: "do_nothing",
          avatar_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        });
      });
  });
  test("GET:404 returns an error when a valid but non-existent username is received", () => {
    return request(app)
      .get("/api/users/doesNotExist")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("user does not exist");
      });
  });
});

describe("path not found", () => {
  test("GET:404 path not found", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("path not found");
      });
  });
});
