'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteHandler = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ResponseBody = require('./ResponseBody');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RouteHandler = exports.RouteHandler = function () {
  function RouteHandler(Model) {
    _classCallCheck(this, RouteHandler);

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

  _createClass(RouteHandler, [{
    key: 'index',
    value: function index(request, response, next) {
      var _this = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var query = request.query;


      Model.index(query, function (error) {
        var documents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        var responseBody = void 0;
        if (_this._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK', documents);
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: 'findById',
    value: function findById(request, response, next) {
      var _this2 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var params = request.params;

      var id = params.id;

      Model.findById(id, function (error) {
        var documents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var responseBody = void 0;
        if (_this2._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK', documents);
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: 'create',
    value: function create(request, response, next) {
      var _this3 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var body = request.body;


      Model.create(body, function (error, document) {
        var responseBody = void 0;
        if (_this3._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(201, 'OK', document);
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: 'update',
    value: function update(request, response, next) {
      var _this4 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var params = request.params,
          body = request.body;

      var _id = params.id;

      Model.update({ _id: _id }, body, function (error, msg) {
        var responseBody = void 0;
        if (_this4._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK');
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: 'remove',
    value: function remove(request, response, next) {
      var _this5 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var params = request.params;

      var _id = params.id;

      Model.remove({ _id: _id }, function (error) {
        var responseBody = void 0;
        if (_this5._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK');
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: '_handleError',
    value: function _handleError(error, response) {
      var responseBody = void 0;

      if (error && error.constructor === _ResponseBody.ResponseBody) {
        response.body = error;
        return true;
      } else if (error) {
        responseBody = new _ResponseBody.ResponseBody(500, error.toString());
        response.body = responseBody;
        return true;
      }

      return false;
    }
  }]);

  return RouteHandler;
}();