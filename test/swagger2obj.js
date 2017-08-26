'use strict';

var should = require('chai').should();
var fs = require('fs');
var swagger2obj = require('swagger2obj');

var Swagger = require('../');
var testFileName = 'test-swagger2obj.swagger';

function checkSwagger(swagger, done) {
  swagger.generate(function (err, swaggerText) {
    fs.writeFile(testFileName, swaggerText, function (err) {
      swagger2obj.parse(testFileName).then(function (result) {
        done();
      }, function (error) {

        done(error);
      });
    });
  });
}

describe('testing with swagger2obj', function () {

    describe('Simple Swagger', function () {

        beforeEach(function () {
          this.swagger = new Swagger({
            title: 'Testing',
            baseUri: 'http://localhost:3000',
            versionAPI: 'v1',
          });
        });

        afterEach(function () {
          fs.unlinkSync(testFileName);
          this.swagger = null;
        });

        it('empty Swagger', function (done) {
          checkSwagger(this.swagger, done);
        });

        it('swagger with type only', function (done) {
          this.swagger.type('books', {
            name: { type: 'string', required: true },
            numberOfPages: { type: 'integer' },
            author: {
              name: { type: 'string' },
              email: { type: 'email' },
            },
          });
          checkSwagger(this.swagger, done);
        });

        it('swagger with type and schema', function (done) {
          this.swagger.type('books', {
            name: { type: 'string', required: true },
            numberOfPages: { type: 'integer' },
            author: {
              name: { type: 'string' },
              email: { type: 'email' },
            },
          });

          this.swagger.methods('books', 'get', {
            description: 'Get information about all books',
            responses: {
              200: { 'application/json': [{ name: 'one', author: { name: 'Art' } }] },
              404: { 'application/json': { code: '120', message: 'Books not found' } },
            },
          });

          checkSwagger(this.swagger, done);
        });

        it('swagger with type and schema', function (done) {
          this.swagger.type('books', {
            name: { type: 'string', required: true },
            numberOfPages: { type: 'integer' },
            author: {
              name: { type: 'string' },
              email: { type: 'email' },
            },
          });

          this.swagger.methods('books/:id', 'delete', {
            description: 'Delete {bookId} book',
            responses: {
              200: { 'application/json': { ok: 1, _id: 123 } },
              404: { 'application/json': { code: '121', message: 'Book not found' } },
            },
          });

          this.swagger.methods('books', {
            get: {
              description: 'Get information about all books',
              responses: {
                200: { 'application/json': [{ name: 'one', author: { name: 'Art' } }] },
                404: { 'application/json': { code: '120', message: 'Books not found' } },
              },
            },
            post: {
                description: 'Add new book',
                body: {
                    'application/json': {
                        type: 'books',
                        example: { name: 'one', author: { name: 'Art' } },
                      },
                  },
                responses: {
                  201: { 'application/json': { name: 'one', author: { name: 'Art' } } },
                  400: { 'application/json': { code: '221', message: 'name is not string type' } },
                },
              },
          });

          checkSwagger(this.swagger, done);
        });

      });

    describe('errors', function () {

        beforeEach(function () {
          this.swagger = new Swagger({ templateFileName: 'template/noFile' });
        });

        afterEach(function () {
          this.swagger = null;
        });

        it('file not exists testing', function (done) {
          this.swagger.generate(function (err, swaggerText) {
            (err instanceof Error).should.equal(true);
            String(err).should.match(/ENOENT: no such file/);
            done();
          });
        });

      });

  });

