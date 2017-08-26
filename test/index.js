'use strict';
var should = require('chai').should();
var Swagger = require('../');

describe('testing v1.0 with no validators', function () {

    describe('check if text is in generated swagger', function () {

        beforeEach(function () {
          this.swagger = new Swagger({
            title: 'Testing',
            baseUri: 'http://localhost:3000',
            versionAPI: 'v1',
          });
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
              200: { 'application/json': [{ name: 'one', author: { name: 'Bert' } }] },
              404: { 'application/json': { code: '120', message: 'Books was found' } },
            },
          });
          this.swagger.methods('books', 'get', {
            description: 'Get information about all books',
            responses: {
              200: { 'application/json': [{ name: 'one', author: { name: 'Art' } }] },
              404: { 'application/json': { code: '120', message: 'Books not found' } },
            },
          });
        });

        afterEach(function () {
          this.swagger = null;
        });

        it('check generated file', function (done) {
          this.swagger.generate(function (err, swaggerText) {
            (err instanceof Error).should.equal(false);
            swaggerText.should.match(/#%Swagger 1.0/);
            swaggerText.should.match(/title: Testing/);
            swaggerText.should.match(/baseUri: http:\/\/localhost:3000/);
            swaggerText.should.match(/version: v1/);
            swaggerText.should.match(/types:/);
            swaggerText.should.match(/\/books/);
            swaggerText.should.match(/numberOfPages/);
            swaggerText.should.match(/Get information about all books/);
            swaggerText.should.match(/200/);
            swaggerText.should.match(/Art/);
            swaggerText.should.match(/Books not found/);
            done();
          });
        });
      });

    describe('type and methods getters', function () {

        beforeEach(function () {
          this.swagger = new Swagger();
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
        });

        afterEach(function () {
          this.swagger = null;
        });

        it('type testing', function (done) {
          this.swagger.type().should.eql({
            books: {
              name: { type: 'string', required: true },
              numberOfPages: { type: 'integer' },
              author: { name: { type: 'string' }, email: { type: 'email' } },
            },
          });

          this.swagger.type('books').should.eql({
            name: { type: 'string', required: true },
            numberOfPages: { type: 'integer' },
            author: { name: { type: 'string' }, email: { type: 'email' } },
          });

          done();
        });

        it('methods testing', function (done) {
          this.swagger.methods().should.eql({
            books: {
              get: {
                description: 'Get information about all books',
                responses: {
                  200: { 'application/json': [{ name: 'one', author: { name: 'Art' } }] },
                  404: { 'application/json': { code: '120', message: 'Books not found' } },
                },
              },
            },
          });

          this.swagger.methods('books').should.eql({
            get: {
              description: 'Get information about all books',
              responses: {
                200: { 'application/json': [{ name: 'one', author: { name: 'Art' } }] },
                404: { 'application/json': { code: '120', message: 'Books not found' } },
              },
            },
          });

          done();
        });

      });

    describe('empty type and methods getters', function () {

        beforeEach(function () {
          this.swagger = new Swagger();
        });

        afterEach(function () {
          this.swagger = null;
        });

        it('type testing', function (done) {
          this.swagger.type().should.eql({});
          (typeof this.swagger.type('books') === 'undefined').should.equal(true);
          done();
        });

        it('methods testing', function (done) {
          this.swagger.methods().should.eql({});
          (typeof this.swagger.methods('books') === 'undefined').should.equal(true);
          done();
        });

      });

  });

