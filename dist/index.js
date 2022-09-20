"use strict";
const transform_1 = require("./transform");
const plugin = (options) => {
    return transform_1.transform(options);
};
module.exports = plugin;
