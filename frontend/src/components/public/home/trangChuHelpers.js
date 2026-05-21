// Helper nhỏ cho trang chủ.
export function ganThamSoTimKiem(params, form) {
  Object.entries(form).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','));
      return;
    }

    if (value === true) {
      params.set(key, 'true');
      return;
    }

    if (value === false || value === '' || value === null || value === undefined) return;
    params.set(key, String(value));
  });
}
