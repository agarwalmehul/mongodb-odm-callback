'use strict'

import mongoose from 'mongoose'
import async from 'async'

export class MongoModel {
  constructor (modelName, Schema) {
    this.ModelName = modelName
    this.Schema = Schema
    this.MongooseModel = mongoose.model(modelName, Schema)
    this._queryParams = Schema._queryParams
    this._filterQuery = Schema._filterQuery

    // Method Hard-Binding
    this._execQuery = this._execQuery.bind(this)
    this._findRaw = this._findRaw.bind(this)
    this._findOneRaw = this._findOneRaw.bind(this)
    this._find = this._find.bind(this)
    this._findOne = this._findOne.bind(this)
    this.scan = this.scan.bind(this)
    this.findById = this.findById.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.remove = this.remove.bind(this)
  }

  // Method _execQuery: Select, Populate and Sort Mongo query results
  // as configured in the Schema
  _execQuery (query, callback) {
    const queryParams = this._queryParams
    let queryResult = query.sort({ _id: -1 })

    if (queryParams && queryParams.select) {
      queryResult = queryResult.select(queryParams.select)
    }

    if (queryParams && queryParams.populate) {
      queryResult = queryResult.populate(queryParams.populate)
    }

    return queryResult.exec(callback)
  }

  // Method _findRaw: Finds all documents as per attribute criterias
  // and returns them in their natural structure without transforming
  _findRaw (attrs, callback) {
    this.MongooseModel.find(attrs || {}).exec(callback)
  }

  // Method _findRawOne: Finds first document as per attribute criterias
  // and returns it in its natural structure without transforming
  _findOneRaw (attrs = {}, callback) {
    this.MongooseModel.findOne(attrs).exec(callback)
  }

  // Method _find: Finds all documents as per attribute criterias,
  // transforms result using the _execQuery method and returns it.
  _find (attrs = {}, callback) {
    const query = this.MongooseModel.find(attrs).lean()
    this._execQuery(query, callback)
  }

  // Method _findOne: Finds first document as per attribute criterias,
  // transforms result using the _execQuery method and returns it.
  _findOne (attrs = {}, callback) {
    const query = this.MongooseModel.findOne(attrs).lean()
    this._execQuery(query, callback)
  }

  // Method scan: Finds all documents, transforms result using
  // the _execQuery method and returns it.
  scan (query, callback) {
    let params = {};
    (this._filterQuery || []).forEach(key => {
      let value = query[key]
      if (value !== undefined) {
        if (typeof value === 'string') {
          params[key] = { $in: value.split(',') }
        } else {
          params[key] = value
        }
      }
    })

    this._find(params, callback)
  }

  // Method findById: Finds document bearing mentioned _id property value,
  // transforms result using  the _execQuery method and returns it.
  findById (id, callback) {
    const ids = id.toString().split(',')
    const findOneOrFind = ids.length === 1 ? this._findOne : this._find
    findOneOrFind({ _id: { $in: ids } }, callback)
  }

  // Method create: Creates a new document with the provided attributes.
  // Only properties mentioned in the Schema will be stored while other
  // properties being discarded.
  create (attrs, callback) {
    const _this = this
    async.waterfall([
      // Create Document
      next => {
        _this.MongooseModel.create(attrs, next)
      },

      // Get Documents
      (documents, next) => {
        let documentIds = []

        if (!documents) {
          return next(null, [])
        }

        // If Array, join all _ids
        if (documents instanceof Array) {
          documents.forEach(document => {
            const _id = document._id.toString()
            documentIds.push(_id)
          })
        } else {
          // If JSON Object, get _id
          documentIds.push(documents._id.toString())
        }

        documentIds = documentIds.join()
        _this.findById(documentIds, next)
      }
    ], callback)
  }

  // Method update: Updates the document bearing mentioned _id
  // property value. It works by updating the entire document
  // and not patching changes.
  update (query = {}, $set = {}, callback) {
    this.MongooseModel.update(query, { $set }, { multi: true }, callback)
  }

  // Method remove: Deletes the document bearing mentioned _id
  // property value.
  remove (query = {}, callback) {
    this.MongooseModel.remove(query, callback)
  }

  // Method aggregate: Get Computed Result
  aggregate (query, callback) {
    this.MongooseModel.aggregate(query, callback)
  }
}
