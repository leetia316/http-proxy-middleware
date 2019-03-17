"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const url = require("url");
const isGlob = require("is-glob");
const micromatch = require("micromatch");
const errors_1 = require("./errors");
function match(context, uri, req) {
    // single path
    if (isStringPath(context)) {
        return matchSingleStringPath(context, uri);
    }
    // single glob path
    if (isGlobPath(context)) {
        return matchSingleGlobPath(context, uri);
    }
    // multi path
    if (Array.isArray(context)) {
        if (context.every(isStringPath)) {
            return matchMultiPath(context, uri);
        }
        if (context.every(isGlobPath)) {
            return matchMultiGlobPath(context, uri);
        }
        throw new Error(errors_1.ERRORS.ERR_CONTEXT_MATCHER_INVALID_ARRAY);
    }
    // custom matching
    if (_.isFunction(context)) {
        var pathname = getUrlPathName(uri);
        return context(pathname, req);
    }
    throw new Error(errors_1.ERRORS.ERR_CONTEXT_MATCHER_GENERIC);
}
exports.match = match;
/**
 * @param  {String} context '/api'
 * @param  {String} uri     'http://example.org/api/b/c/d.html'
 * @return {Boolean}
 */
function matchSingleStringPath(context, uri) {
    var pathname = getUrlPathName(uri);
    return pathname.indexOf(context) === 0;
}
function matchSingleGlobPath(pattern, uri) {
    var pathname = getUrlPathName(uri);
    var matches = micromatch([pathname], pattern);
    return matches && matches.length > 0;
}
function matchMultiGlobPath(patternList, uri) {
    return matchSingleGlobPath(patternList, uri);
}
/**
 * @param  {String} contextList ['/api', '/ajax']
 * @param  {String} uri     'http://example.org/api/b/c/d.html'
 * @return {Boolean}
 */
function matchMultiPath(contextList, uri) {
    for (var i = 0; i < contextList.length; i++) {
        var context = contextList[i];
        if (matchSingleStringPath(context, uri)) {
            return true;
        }
    }
    return false;
}
/**
 * Parses URI and returns RFC 3986 path
 *
 * @param  {String} uri from req.url
 * @return {String}     RFC 3986 path
 */
function getUrlPathName(uri) {
    return uri && url.parse(uri).pathname;
}
function isStringPath(context) {
    return _.isString(context) && !isGlob(context);
}
function isGlobPath(context) {
    return isGlob(context);
}
