"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.PartialSQL = exports.Skip = void 0;
var DynamicSQL = /** @class */ (function () {
    function DynamicSQL(xs, params) {
        if (xs === void 0) { xs = []; }
        if (params === void 0) { params = []; }
        this.xs = xs;
        this.params = params;
    }
    return DynamicSQL;
}());
var Skip = /** @class */ (function (_super) {
    __extends(Skip, _super);
    function Skip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Skip;
}(DynamicSQL));
exports.Skip = Skip;
var PartialSQL = /** @class */ (function (_super) {
    __extends(PartialSQL, _super);
    function PartialSQL() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PartialSQL;
}(DynamicSQL));
exports.PartialSQL = PartialSQL;
