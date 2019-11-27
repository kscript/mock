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
var Base = /** @class */ (function () {
    function Base() {
        this.data = {};
    }
    Base.prototype.get = function (key) {
        return key ? this.data[key] : this.data;
    };
    Base.prototype.set = function (key, val) {
        this.data[key] = val;
        return this;
    };
    Base.prototype.reset = function (obj) {
        this.clear();
        Object.assign(this.data, obj);
        return this;
    };
    Base.prototype.clear = function () {
        for (var key in this.data) {
            delete this.data[key];
        }
        return this;
    };
    return Base;
}());
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.data = {
            login: false
        };
        return _this;
    }
    return Server;
}(Base));
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.data = {};
        return _this;
    }
    return User;
}(Base));
var Config = /** @class */ (function (_super) {
    __extends(Config, _super);
    function Config() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.data = {
            username: 'admin',
            password: '123456',
            retryUrl: 'http://localhost:3030/info'
        };
        return _this;
    }
    return Config;
}(Base));
exports.server = new Server;
exports.user = new User;
exports.config = new Config;
exports.crossDomain = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': true
};
exports["default"] = {
    user: exports.user,
    server: exports.server,
    config: exports.config,
    crossDomain: exports.crossDomain
};
