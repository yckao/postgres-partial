"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.wrap = void 0;
var types_1 = require("./types");
function partial(xs) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return new types_1.PartialSQL(xs, args);
}
function parseParam(strs, params, next, param) {
    var prev = strs[strs.length - 1];
    if (param instanceof types_1.Skip) {
        strs[strs.length - 1] = prev.trimRight() + next;
        return {
            strs: strs,
            params: params
        };
    }
    if (param instanceof types_1.PartialSQL) {
        var _a = parse.apply(void 0, __spreadArrays([param.xs], param.params)), _strs = _a.strs, _params = _a.params;
        _strs[_strs.length - 1] += next;
        strs[strs.length - 1] += _strs[0];
        strs.push.apply(strs, _strs.slice(1));
        params.push.apply(params, _params);
        return {
            strs: strs,
            params: params
        };
    }
    strs.push(next);
    params.push(param);
    return {
        strs: strs,
        params: params
    };
}
function parse(strs) {
    var _a;
    var params = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        params[_i - 1] = arguments[_i];
    }
    var _strs = [strs[0].toString()];
    var _params = [];
    for (var i = 0; i < params.length; i++) {
        (_a = parseParam(_strs, _params, strs[i + 1].toString(), params[i]), _strs = _a.strs, _params = _a.params);
    }
    return {
        strs: _strs,
        params: _params
    };
}
function wrap(sql) {
    function wrapper(strs) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        var _a = parse.apply(void 0, __spreadArrays([strs], params)), _strs = _a.strs, _params = _a.params;
        var tsa = Object.assign(_strs, { raw: _strs.slice() });
        return sql.apply(void 0, __spreadArrays([tsa], _params));
    }
    var skip = new types_1.Skip();
    return Object.assign(wrapper, sql, { partial: partial, skip: skip });
}
exports.wrap = wrap;
