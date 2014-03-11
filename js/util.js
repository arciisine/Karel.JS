/**
 * General Utilities
 */
define([], function() {
  function positionString(pos, dir) {
    return '' + pos.x + ',' + pos.y + ',' + (dir === undefined ? '' : dir);
  }

  function bound(v, u, l) {
    return Math.max(l, Math.min(v, u));
  }

  function toDefault(obj, key, def) {
    def = (def === undefined) ? 0 : def;
    obj[key] = (typeof obj[key] !== 'number') ? def : obj[key];
    return obj[key];
  }

  function change(obj, key, delta, rng) {
    var prev = obj[key];
    rng = rng || [0, Number.MAX_VALUE];
    obj[key] = bound(obj[key] + delta, rng[1], rng[0]);
    return prev !== obj[key];
  }

  function isIn(v, rng) {
    return v >= rng[0] && v <= rng[1];
  }

  return {
    positionString : positionString,
    bound : bound,
    toDefault : toDefault,
    change : change,
    isIn : isIn
  }
});