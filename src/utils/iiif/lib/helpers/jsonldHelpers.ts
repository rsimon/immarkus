export const getProperty = (obj: object, name: string) => {
  let prop: any = obj[name];

  if (!prop)
    prop = obj['@' + name];

  return prop;
}

export const getLabelValue = (obj: any, name: string, locale?: string) => {
  const prop = getProperty(obj, name);

  if (!prop) return;

  if (typeof prop === 'string') return prop;

  /*
  const localized = rawValue[defaultLocale];
  if (localized) {
    return localized[0];
  } else {
    // Fallback #1
    const en = rawValue['en'];
    if (en) {
      return en[0];
    } else {
      // Fallback #2
      const values = Object.values(rawValue).reduce<string[]>((flattened, value) => {
        return Array.isArray(value) ? [...flattened, ...value] : [...flattened, value]
      }, []);

      return values.length > 0 ? values[0] : undefined;
    }
  }
  */
}