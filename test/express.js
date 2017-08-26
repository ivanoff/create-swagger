'use strict';
var should = require('chai').should();
var express = require('express');
var httpMocks = require('node-mocks-http');
var Swagger = require('../');

describe('testing express', function () {

  describe('check generated swagger', function () {
    var app = { _router: { stack: [
      undefined,
      { },
      { route: { path: 'no_methods' } },
      { route: { methods: 'not_object' } },
      { route: { methods: { no_path: true } } },
      { route: { path: '/aaa', methods: { get: true } } },
      { route: { path: '/aaa', methods: { post: true } } },
      { route: { path: '/aaa/:idAaa', methods: { get: true } } },
      { route: { path: '/bbb', methods: { get: true } } },
    ], }, };
    app.use = function() {};
    app.get = function() {};

    beforeEach(function () {
      this.swagger = new Swagger({ express: app, storeResponses: true });
    });

    afterEach(function () {
      this.swagger = null;
    });

    it('app is undefined', function (done) {
      this.swagger.express({}, { send: function (data) {
          data.should.match(/^\/aaa:/m);
          data.should.match(/^\/bbb:/m);
          data.should.match(/\s\/{idAaa}:(.|\s)+\/bbb/);
          done();
        }, });
    });
  });

  [undefined, { _router: undefined }, { _router: { stack: undefined } }].forEach(function (app) {
    describe('check various empties app', function () {
      beforeEach(function () {
        if(app) app.use = function() {};
        if(app) app.get = function() {};
        this.swagger = new Swagger({ express: app, storeResponses: true });
      });

      afterEach(function () {
        this.swagger = null;
      });

      it('app is undefined', function (done) {
        this.swagger.express({}, { send: function (data) {
            data.should.match(/^#%Swagger 1.0/m);
            data.should.match(/^title:/m);
            data.should.match(/^version:/m);
            (data.split('\n').length <= 6).should.equal(true);
            done();
          }, });
      });
    });
  });

  describe('express workflow', function () {

    beforeEach(function () {
      this.app = express()
      this.app.get('/b', function (req, res) { res.send('b1:') });
      this.app.post('/b', function (req, res) { res.send('b2:') });
      this.app.get('/b/:id', function (req, res) { res.send('b3:' + req.params.id) });
      this.app.delete('/b/:id', function (req, res) { res.send('b4:' + req.params.id) });

      this.swagger = new Swagger({express: this.app, storeResponses: true, guessAll: true});
      this.app.get('/api.swagger', this.swagger.express.bind(this.swagger));
    });

    afterEach(function () {
      this.swagger = null;
      this.app = null;
    });

    it('typical usage', function (done) {
      this.swagger.express({}, { send: function (data) {
          data.should.match(/^\/b:/m);
          data.should.match(/^\s+\/{id}:/m);
          done();
        }, });
    });
  });

});

describe('with httpMocks no guessAll', function () {

    var app = { _router: { stack: [
      { route: { path: '/aaa', methods: { get: true } } },
      { route: { path: '/aaa', methods: { post: true } } },
      { route: { path: '/aaa/:id', methods: { get: true } } },
    ], }, };
    app.use = function() {};
    app.get = function() {};

    var swagger = new Swagger({ express: app, storeResponses: true });
    var request = {};
    var response = {};

    beforeEach(function(done) {
      response = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
      });
      done();
    });

    it('post /aaa', function (done) {

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/aaa',
        query: {
          name: 'foo'
        },
        headers: {
          'content-type' : 'application/json',
        },
        body: {
          name: 'foo'
        },
        route: {
          path: '/aaa',
          stack: [{
            method: 'post',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(201);
        response._headers['content-type'] = 'application/json';
        response.end('{"name":"foo"}');
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('post /aaa again', function (done) {

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/aaa',
        query: {
          name: 'foo'
        },
        headers: {
          'content-type' : 'application/json',
        },
        body: {
          name: 'foo'
        },
        route: {
          path: '/aaa',
          stack: [{
            method: 'post',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(201);
        response._headers['content-type'] = 'application/json';
        response.end('{"error":"conflict"}');
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });
});

describe('with httpMocks', function () {

    var app = { _router: { stack: [
      { route: { path: '/aaa', methods: { get: true } } },
      { route: { path: '/aaa', methods: { post: true } } },
      { route: { path: '/aaa/:id', methods: { get: true } } },
    ], }, };
    app.use = function() {};
    app.get = function() {};

    var swagger = new Swagger({ express: app, storeResponses: true, guessAll: true });
    var request = {};
    var response = {};

    beforeEach(function(done) {
      response = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
      });
      done();
    });

    it('get /aaa/1/bbb', function (done) {

      request = httpMocks.createRequest({
        method: 'GET',
        url: '/aaa/1/bbb',
        route: {
          path: '/aaa/:id/bbb',
          stack: [{
            method: 'get',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(200);
        response._headers['content-type'] = 'application/json';
        response.end('{"name":"foo"}');
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('post /aaa', function (done) {

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/aaa',
        query: {
          name: 'foo'
        },
        headers: {
          'content-type' : 'application/json',
        },
        body: {
          name: 'foo'
        },
        route: {
          path: '/aaa',
          stack: [{
            method: 'post',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(201);
        response._headers['content-type'] = 'application/json';
        response.end('{"name":"foo"}');
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('post /aaa again', function (done) {

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/aaa',
        query: {
          name: 'foo'
        },
        headers: {
          'content-type' : 'application/json',
        },
        body: {
          name: 'foo'
        },
        route: {
          path: '/aaa',
          stack: [{
            method: 'post',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(201);
        response._headers['content-type'] = 'application/json';
        response.end('{"error":"conflict"}');
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('post /aaa again', function (done) {

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/aaa',
        query: {
          name: 'foo'
        },
        headers: {
          'content-type' : 'application/json',
        },
        body: {
          name: 'foo'
        },
        route: {
          path: '/aaa',
          stack: [{
            method: 'post',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(409);
        response._headers['content-type'] = 'text/other';
        response.end('{"error":"conflict"}');
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('post /aaa unknown content type', function (done) {

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/aaa',
        query: {
          name: 'foo'
        },
        headers: {
          'content-type' : 'unknown',
        },
        body: {
          name: 'foo'
        },
        route: {
          path: '/aaa',
          stack: [{
            method: 'post',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(400);
        response._headers['content-type'] = 'unknown';
        response.end('{"name":"foo"}');
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('delete /aaa/123', function (done) {

      request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/aaa/123',
        query: {
          name: 'foo'
        },
        route: {
          path: '/aaa/123',
          stack: [{
            method: 'delete',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(400);
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('delete /aaa/123 again', function (done) {

      request = httpMocks.createRequest({
        method: 'DELETE',
        url: '/aaa/123',
        query: {
          name: 'foo'
        },
        route: {
          path: '/aaa/123',
          stack: [{
            method: 'delete',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(400);
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('post /xxx', function (done) {

      request = httpMocks.createRequest({
        method: 'POST',
        url: '/xxx',
        query: {
          name: 'foo'
        },
        route: {
          path: '/xxx',
          stack: [{
            method: 'post',
          }]
        }
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(400);
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

    it('no route', function (done) {
      request = httpMocks.createRequest({
        method: 'GET',
        url: '/aaaBBB',
        query: {
          name: 'foo'
        },
      });

      response.on('end', function () {
        // console.log(response._getData());
        response.status(400);
        done();
      });

      var _this = this;
      swagger.storeResponses(request, response, function next(error) {
        swagger.express(request, response, function next(error) {
        });
      });
    });

});

