/* @flow */

function getX<K, V>(m: Map<K, V>, key: K): V {
  const v = m.get(key);
  if (v == null) {
    throw new Error('no value for key ' + String(key));
  }
  return v;
}

module.exports = {getX};
