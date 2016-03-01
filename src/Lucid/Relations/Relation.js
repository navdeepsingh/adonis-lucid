'use strict'

/**
 * adonis-lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

require('harmony-reflect')
const proxyHandler = require('./proxyHandler')
const NE = require('node-exceptions')
class ModelRelationException extends NE.LogicalException {}
class ModelRelationSaveException extends NE.LogicalException {}

class Relation {

  constructor () {
    return new Proxy(this, proxyHandler)
  }

  /**
   * returns the first match item for related model
   *
   * @return {Object}
   *
   * @public
   */
  first () {
    if (!this.parent.$primaryKeyValue) {
      throw new ModelRelationException('cannot fetch related model from an unsaved model instance')
    }
    this.relatedQuery.where(this.toKey, this.parent[this.fromKey])
    return this.relatedQuery.first()
  }

  /**
   * returns the first match item for related model
   *
   * @return {Object}
   *
   * @public
   */
  fetch () {
    if (!this.parent.$primaryKeyValue) {
      throw new ModelRelationException('cannot fetch related model from an unsaved model instance')
    }
    this.relatedQuery.where(this.toKey, this.parent[this.fromKey])
    return this.relatedQuery.fetch()
  }

  /**
   * adds with clause to related query, it almost becomes a recursive
   * loop until we get all nested relations
   *
   * @method addWith
   *
   * @param  {Array} keys
   *
   * @public
   */
  addWith (keys) {
    this.relatedQuery.with(keys)
  }

  /**
   * adds a scope to related query
   *
   * @method addScope
   *
   * @param  {String}   key
   * @param  {Function} callback
   *
   * @public
   */
  addScope (key, callback) {
    this.relatedQuery.scope(key, callback)
  }

  * save (relatedInstance) {
    if (relatedInstance instanceof this.related === false) {
      throw new ModelRelationSaveException('save accepts an instance of related model')
    }
    if (!this.parent.$primaryKeyValue) {
      throw new ModelRelationSaveException('cannot save relation for an unsaved model instance')
    }
    relatedInstance[this.toKey] = this.parent.$primaryKeyValue
    return yield relatedInstance.save()
  }

  * create (values) {
    if (!this.parent.$primaryKeyValue) {
      throw new ModelRelationSaveException('cannot create relation for an unsaved model instance')
    }
    values[this.toKey] = this.parent.$primaryKeyValue
    return yield this.related.create(values)
  }

}

module.exports = Relation