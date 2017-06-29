'use strict';

require('dotenv').config({path: `${__dirname}/../.test.env`});

const faker = require('faker');
const expect = require('expect');
const superagent = require('superagent');

const server = require('../lib/server.js');
const clearDB = require('./lib/clear-db.js');
const mockPost = require('./lib/mock-post.js');

let tempPost;
const API_URL = process.env.API_URL;

describe('testing /api/posts', () => {
  before(server.start);
  after(server.stop);
  afterEach(clearDB);

  describe('testing POST routes', () => {
    let data = {
      title: faker.name.title(),
      author: faker.name.firstName(),
      content: faker.lorem.sentences(),
    };
    it('should respond with a post', () => {
      return superagent.post(`${API_URL}/api/posts`)
        .send(data)
        .then(res => {
          console.log('data', data);
          expect(res.status).toEqual(200);
          expect(res.body.title).toEqual(data.title);
          expect(res.body.author).toEqual(data.author);
          expect(res.body.content).toEqual(data.content);
          expect(res.body.comments).toEqual([]);
          expect(res.body._id).toExist();
        });
    });

    it('should respond with a 400 because no body', () => {
      return superagent.post(`${API_URL}/api/posts`)
        .catch(res => {
          expect(res.status).toEqual(400);
        });
    });

    it('should respond with a 409', () => {
      return superagent.post(`${API_URL}/api/posts`)
        .send(data)
        .catch(res => {
          expect(res.status).toEqual(409);
        });
    });
  });

  describe('testing GET /api/posts/:id', () => {
    it('should respond with a post', () => {
      let tempPost;
      return mockPost.createOne()
        .then(post => {
          tempPost = post;
          return superagent.get(`${API_URL}/api/posts/${post._id}`);
        })
        .then(res => {
          expect(res.status).toEqual(200);
          expect(res.body.title).toEqual(tempPost.title);
          expect(res.body.comments).toEqual([]);
          expect(res.body._id).toExist();
        });
    });

    it('should respond with a 404 not found', () => {
      return superagent.get(`${API_URL}/api/blogs/5437`)
        .catch(res => {
          expect(res.status).toEqual(404);
        });
    });
  });

  describe('testing PUT /api/lists/:id', () => {
    it('should respond with a 200 and updated post', () => {
      return mockPost.createOne()
        .then(createdPost => {
          return superagent.put(`${API_URL}/api/posts/${createdPost._id}`)
            .send({author: 'Maeve'})
            .then(() => {
              console.log('createdPost', createdPost);
              return superagent.get(`${API_URL}/api/posts/${createdPost._id}`)
                .then(res => {
                  console.log(res.body);
                  expect(res.status).toEqual(200);
                  expect(res.body.author).toEqual('Maeve');
                  expect(res.body.title).toEqual(createdPost.title);
                  expect(res.body._id).toExist();
                });
            });
        });
    });
  });
});
