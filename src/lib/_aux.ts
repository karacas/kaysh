export function __strToHash(str = ''): string {
  let hash = 0,
    i,
    chr;

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  return hash.toString(36);
}

function getShortValue(val: any) {
  if (Number.isInteger(val) && String(val).length) return 'num_' + val;

  if (typeof val === 'string') {
    if (val.length === 0) return 'emptyString__';
    return 'str_' + val;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return 'emptyArray__';

    if (val.length === 1) {
      if (Number.isInteger(val[0]) && String(val[0]).length) return '_num_' + val[0];

      if (typeof val[0] === 'string') {
        if (val[0].length === 0) return '_emptyString__';
        return '_str_' + val[0];
      }
    }
  }

  return null;
}

export function __objToHash(val: any, fast = true) {
  if (val === undefined) return '__undefined__';
  if (val === null) return '__null__';

  if (fast) {
    let shortValue = getShortValue(val);
    if (shortValue != null && shortValue.length > 0 && shortValue.length < 32) return shortValue;
  }

  return __strToHash(JSON.stringify(val));
}
