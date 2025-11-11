export const getType = (value) =>
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
export const isObject = (value) => getType(value) === "object";
export const isDOMRect = (value) =>
  getType(value) === "domrect" || getType(value) === "domrectreadonly";
export const isArray = (value) => getType(value) === "array";
export const isString = (value) => getType(value) === "string";
export const isNumber = (value) => getType(value) === "number";
export const isBoolean = (value) => getType(value) === "boolean";
export const isNull = (value) => value === null;
export const isUndefined = (value) => value === undefined;
