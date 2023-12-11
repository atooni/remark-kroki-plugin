"use strict";
const transform_1 = require("./transform");
const plugin = (options) => {
    return (0, transform_1.transform)(options);
};
module.exports = plugin;
