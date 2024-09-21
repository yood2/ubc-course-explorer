"use strict";
/*
 * This is the primary high-level API for the project. In this folder there should be:
 * A class called InsightFacade, this should be in a file called InsightFacade.ts.
 * You should not change this interface at all or the test suite will not work.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ResultTooLargeError = exports.NotFoundError = exports.InsightError = exports.InsightDatasetKind = void 0;
var InsightDatasetKind;
(function (InsightDatasetKind) {
    InsightDatasetKind["Sections"] = "sections";
    InsightDatasetKind["Rooms"] = "rooms";
})(InsightDatasetKind = exports.InsightDatasetKind || (exports.InsightDatasetKind = {}));
var InsightError = /** @class */ (function (_super) {
    __extends(InsightError, _super);
    function InsightError(message) {
        var _this = _super.call(this, message) || this;
        Error.captureStackTrace(_this, InsightError);
        return _this;
    }
    return InsightError;
}(Error));
exports.InsightError = InsightError;
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message) {
        var _this = _super.call(this, message) || this;
        Error.captureStackTrace(_this, NotFoundError);
        return _this;
    }
    return NotFoundError;
}(Error));
exports.NotFoundError = NotFoundError;
var ResultTooLargeError = /** @class */ (function (_super) {
    __extends(ResultTooLargeError, _super);
    function ResultTooLargeError(message) {
        var _this = _super.call(this, message) || this;
        Error.captureStackTrace(_this, ResultTooLargeError);
        return _this;
    }
    return ResultTooLargeError;
}(Error));
exports.ResultTooLargeError = ResultTooLargeError;
