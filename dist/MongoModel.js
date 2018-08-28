'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MongoModel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoModel = exports.MongoModel = function () {
  function MongoModel(modelName, Schema) {
    _classCallCheck(this, MongoModel);

    this.ModelName = modelName;
    this.Schema = Schema;
    this.MongooseModel = _mongoose2.default.model(modelName, Schema);
    this._queryParams = Schema._queryParams;
    this._filterQuery = Schema._filterQuery;

    // Method Hard-Binding
    this._execQuery = this._execQuery.bind(this);
    this._findRaw = this._findRaw.bind(this);
    this._findOneRaw = this._findOneRaw.bind(this);
    this._find = this._find.bind(this);
    this._findOne = this._findOne.bind(this);
    this.index = this.index.bind(this);
    this.findById = this.findById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  // Method _execQuery: Select, Populate and Sort Mongo query results
  // as configured in the Schema


  _createClass(MongoModel, [{
    key: '_execQuery',
    value: function _execQuery(query, callback) {
      var queryParams = this._queryParams;
      var queryResult = query.sort({ _id: -1 });

      if (queryParams && queryParams.select) {
        queryResult = queryResult.select(queryParams.select);
      }

      if (queryParams && queryParams.populate) {
        queryResult = queryResult.populate(queryParams.populate);
      }

      return queryResult.exec(callback);
    }

    // Method _findRaw: Finds all documents as per attribute criterias
    // and returns them in their natural structure without transforming

  }, {
    key: '_findRaw',
    value: function _findRaw(attrs, callback) {
      this.MongooseModel.find(attrs || {}).exec(callback);
    }

    // Method _findRawOne: Finds first document as per attribute criterias
    // and returns it in its natural structure without transforming

  }, {
    key: '_findOneRaw',
    value: function _findOneRaw() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var callback = arguments[1];

      this.MongooseModel.findOne(attrs).exec(callback);
    }

    // Method _find: Finds all documents as per attribute criterias,
    // transforms result using the _execQuery method and returns it.

  }, {
    key: '_find',
    value: function _find() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var callback = arguments[1];

      var query = this.MongooseModel.find(attrs).lean();
      this._execQuery(query, callback);
    }

    // Method _findOne: Finds first document as per attribute criterias,
    // transforms result using the _execQuery method and returns it.

  }, {
    key: '_findOne',
    value: function _findOne() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var callback = arguments[1];

      var query = this.MongooseModel.findOne(attrs).lean();
      this._execQuery(query, callback);
    }

    // Method index: Finds all documents, transforms result using
    // the _execQuery method and returns it.

  }, {
    key: 'index',
    value: function index(query, callback) {
      var params = {};
      (this._filterQuery || []).forEach(function (key) {
        var value = query[key];
        if (value !== undefined) {
          if (typeof value === 'string') {
            params[key] = { $in: value.split(',') };
          } else {
            params[key] = value;
          }
        }
      });

      this._find(params, callback);
    }

    // Method findById: Finds document bearing mentioned _id property value,
    // transforms result using  the _execQuery method and returns it.

  }, {
    key: 'findById',
    value: function findById(id, callback) {
      var ids = id.toString().split(',');
      var findOneOrFind = ids.length === 1 ? this._findOne : this._find;
      findOneOrFind({ _id: { $in: ids } }, callback);
    }

    // Method create: Creates a new document with the provided attributes.
    // Only properties mentioned in the Schema will be stored while other
    // properties being discarded.

  }, {
    key: 'create',
    value: function create(attrs, callback) {
      var _this = this;
      _async2.default.waterfall([
      // Create Document
      function (next) {
        _this.MongooseModel.create(attrs, next);
      },

      // Get Documents
      function (documents, next) {
        var documentIds = [];

        if (!documents) {
          return next(null, []);
        }

        // If Array, join all _ids
        if (documents instanceof Array) {
          documents.forEach(function (document) {
            var _id = document._id.toString();
            documentIds.push(_id);
          });
        } else {
          // If JSON Object, get _id
          documentIds.push(documents._id.toString());
        }

        documentIds = documentIds.join();
        _this.findById(documentIds, next);
      }], callback);
    }

    // Method update: Updates the document bearing mentioned _id
    // property value. It works by updating the entire document
    // and not patching changes.

  }, {
    key: 'update',
    value: function update() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var $set = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var callback = arguments[2];

      this.MongooseModel.update(query, { $set: $set }, { multi: true }, callback);
    }

    // Method remove: Deletes the document bearing mentioned _id
    // property value.

  }, {
    key: 'remove',
    value: function remove() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var callback = arguments[1];

      this.MongooseModel.remove(query, callback);
    }

    // Method aggregate: Get Computed Result

  }, {
    key: 'aggregate',
    value: function aggregate(query, callback) {
      this.MongooseModel.aggregate(query, callback);
    }
  }]);

  return MongoModel;
}();