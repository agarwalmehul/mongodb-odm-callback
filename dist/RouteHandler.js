'use strict';

import { ResponseBody } from './ResponseBody';

export class RouteHandler {
  constructor(Model) {
    this.Model = Model;

    // Method Hard-Binding to allow them to be assigned to
    // other variables and work as expected
    this.index = this.index.bind(this);
    this.findById = this.findById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this._handleError = this._handleError.bind(this);
  }

  index(request, response, next) {
    if (response.body) {
      return process.nextTick(next);
    }

    const { Model } = this;
    const { query } = request;

    Model.index(query, (error, documents = []) => {
      let responseBody;
      if (this._handleError(error, response)) {
        return next();
      }

      responseBody = new ResponseBody(200, 'OK', documents);
      response.body = responseBody;
      next();
    });
  }

  findById(request, response, next) {
    if (response.body) {
      return process.nextTick(next);
    }

    const { Model } = this;
    const { params } = request;
    const id = params.id;

    Model.findById(id, (error, documents = {}) => {
      let responseBody;
      if (this._handleError(error, response)) {
        return next();
      }

      responseBody = new ResponseBody(200, 'OK', documents);
      response.body = responseBody;
      next();
    });
  }

  create(request, response, next) {
    if (response.body) {
      return process.nextTick(next);
    }

    const { Model } = this;
    const { body } = request;

    Model.create(body, (error, document) => {
      let responseBody;
      if (this._handleError(error, response)) {
        return next();
      }

      responseBody = new ResponseBody(201, 'OK', document);
      response.body = responseBody;
      next();
    });
  }

  update(request, response, next) {
    if (response.body) {
      return process.nextTick(next);
    }

    const { Model } = this;
    const { params, body } = request;
    const _id = params.id;

    Model.update({ _id }, body, (error, msg) => {
      let responseBody;
      if (this._handleError(error, response)) {
        return next();
      }

      responseBody = new ResponseBody(200, 'OK');
      response.body = responseBody;
      next();
    });
  }

  remove(request, response, next) {
    if (response.body) {
      return process.nextTick(next);
    }

    const { Model } = this;
    const { params } = request;
    const _id = params.id;

    Model.remove({ _id }, error => {
      let responseBody;
      if (this._handleError(error, response)) {
        return next();
      }

      responseBody = new ResponseBody(200, 'OK');
      response.body = responseBody;
      next();
    });
  }

  _handleError(error, response) {
    let responseBody;

    if (error && error.constructor === ResponseBody) {
      response.body = error;
      return true;
    } else if (error) {
      responseBody = new ResponseBody(500, error.toString());
      response.body = responseBody;
      return true;
    }

    return false;
  }
}