import {Link, LinkType, Index} from 'rheactor-models'
import {URIValue, URIValueType} from 'rheactor-value-objects'
import {dict, String as StringType, irreducible} from 'tcomb'
import {AggregateIdType} from 'rheactor-event-store'

const IdMapType = dict(StringType, AggregateIdType)

export class JSONLD {
  constructor () {
    this.typeLinks = {
      index: []
    }
    this.typeMap = {}
  }

  /**
   * @param {URIValue} $context
   * @param {URIValue} uri
   */
  mapType ($context, uri) {
    URIValueType($context, ['JSONLD', 'mapType()', '$context:URIValue'])
    URIValueType(uri, ['JSONLD', 'mapType()', 'uri:URIValue'])
    this.typeMap[$context.toString()] = uri.toString()
  }

  /**
   * @param {URIValue} type
   * @param {Link} link
   */
  addLink (type, link) {
    URIValueType(type, ['JSONLD', 'addLink()', 'type:URIValue'])
    LinkType(link, ['JSONLD', 'addLink()', 'link:Link'])
    if (!this.typeLinks[type]) {
      this.typeLinks[type.toString()] = []
    }
    this.typeLinks[type.toString()].push(link)
  }

  addIndexLink (link) {
    LinkType(link)
    this.typeLinks.index.push(link)
  }

  /**
   * @param {URIValue} $context
   * @param {String} id
   * @returns {URIValue}
   */
  createId ($context, id) {
    URIValueType($context, ['JSONLD', 'createId()', '$context:URIValue'])
    AggregateIdType(id, ['JSONLD', 'createId()', 'id:AggregateId'])
    return new URIValue(this.typeMap[$context.toString()].replace(':id', id))
  }

  /**
   * @param {URIValue} $context
   * @param {URIValue} $id
   * @return String
   */
  parseId ($context, $id) {
    URIValueType($context, ['JSONLD', 'parseId()', '$context:URIValue'])
    URIValueType($id, ['JSONLD', 'parseId()', '$id:URIValue'])
    return $id.toString().match(new RegExp(this.typeMap[$context.toString()].replace(':id', '([0-9]+)')))[1]
  }

  /**
   * @param {URIValue} $context
   * @param {object} idMap
   * @returns {Array.<Link>}
   */
  createLinks ($context, idMap) {
    if (typeof idMap !== 'object') {
      idMap = {id: idMap}
    }
    URIValueType($context, ['JSONLD', 'createLinks()', '$context:URIValue'])
    IdMapType(idMap, ['JSONLD', 'createLinks()', 'idMap:Map<String: AggregateId>'])
    return (this.typeLinks[$context.toString()] || []).map(link => {
      let href = link.href.toString()
      for (let k in idMap) {
        href = href.replace(':' + k, idMap[k])
      }
      return new Link(new URIValue(href), link.subject, link.list, link.rel)
    })
  }

  /**
   * @returns {Index}
   */
  index () {
    return new Index(this.typeLinks.index)
  }

  /**
   * Use to turn $Id urls into Strings that can be safely passed around
   *
   * @param {URIValue} id
   * @returns {String}
   */
  encodeId (id) {
    URIValueType(id, ['JSONLD', 'encodeId()', 'id:URIValue'])
    return new Buffer(encodeURI(encodeURIComponent(id.toString())), 'binary').toString('base64')
  }

  /**
   * Returns true if x is of type JSONLD
   *
   * @param {object} x
   * @returns {boolean}
   */
  static is (x) {
    return (x instanceof JSONLD) || (x && x.constructor && x.constructor.name === JSONLD.name && 'typeLinks' in x && 'typeMap' in x)
  }
}

export const JSONLDType = irreducible('JSONLDType', JSONLD.is)
