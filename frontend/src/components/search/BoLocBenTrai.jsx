import { useMemo } from 'react';
import {
  KHOANG_GIA,
  LOAI_PHONG,
  LUA_CHON_DANH_GIA,
  LUA_CHON_CHINH_SACH,
  TIEN_NGHI,
} from './searchOptions';

function SidebarSection({ title, children }) {
  return (
    <div className="border-b border-slate-200 py-5 last:border-0">
      <h3 className="mb-4 text-sm font-bold text-slate-950">{title}</h3>
      {children}
    </div>
  );
}

function BoLocBenTrai({ filters, onChange }) {
  const handleCheckboxChange = (field, value, isArray = false) => {
    if (isArray) {
      const currentValues = filters[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      onChange(field, newValues);
    } else {
      onChange(field, !filters[field]);
    }
  };

  const handleRadioChange = (field, value) => {
    onChange(field, value);
  };

  const selectedPriceBand = useMemo(() => {
    return KHOANG_GIA.find((band) => band.min === filters.minPrice && band.max === filters.maxPrice)?.value || '';
  }, [filters.minPrice, filters.maxPrice]);

  const handlePriceBandChange = (value) => {
    const band = KHOANG_GIA.find((item) => item.value === value) || KHOANG_GIA[0];
    onChange({ minPrice: band.min, maxPrice: band.max });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-950">Bộ lọc nâng cao</h2>
      </div>
      <p className="mb-2 text-xs text-slate-500">Kết quả sẽ tự động cập nhật khi bạn chọn.</p>

      {/* Mức Giá */}
      <SidebarSection title="Mức giá mỗi đêm">
        <div className="grid gap-3">
          {KHOANG_GIA.map((band) => (
            <label key={band.value || 'all'} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="price"
                checked={selectedPriceBand === band.value}
                onChange={() => handlePriceBandChange(band.value)}
                className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-600"
              />
              <span className="text-sm text-slate-700">{band.label}</span>
            </label>
          ))}
        </div>
      </SidebarSection>

      {/* Điểm đánh giá (Sử dụng biểu tượng Sao) */}
      <SidebarSection title="Điểm đánh giá">
        <div className="grid gap-3">
          {LUA_CHON_DANH_GIA.map((option) => (
            <label key={option.value || 'all'} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === option.value}
                onChange={() => handleRadioChange('minRating', option.value)}
                className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-600"
              />
              <span className="text-sm text-slate-700">
                {option.value ? (
                  <span className="flex items-center gap-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-600 text-xs font-bold text-white">
                      {option.value}
                    </span>
                    <span>{option.label.replace(/^[0-9.]+\+? /, '')}</span>
                  </span>
                ) : (
                  option.label
                )}
              </span>
            </label>
          ))}
        </div>
      </SidebarSection>

      {/* Tiện nghi phổ biến (Checkbox) */}
      <SidebarSection title="Tiện nghi phổ biến">
        <div className="grid gap-3">
          {TIEN_NGHI.map((amenity) => (
            <label key={amenity.value} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity.value)}
                onChange={() => handleCheckboxChange('amenities', amenity.value, true)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
              />
              <span className="text-sm text-slate-700">{amenity.label}</span>
            </label>
          ))}
        </div>
      </SidebarSection>

      {/* Loại chỗ ở (Checkbox) */}
      <SidebarSection title="Loại chỗ ở">
        <div className="grid gap-3">
          {LOAI_PHONG.map((type) => (
            <label key={type.value} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters.roomTypes.includes(type.value)}
                onChange={() => handleCheckboxChange('roomTypes', type.value, true)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
              />
              <span className="text-sm text-slate-700">{type.label}</span>
            </label>
          ))}
        </div>
      </SidebarSection>

      {/* Chính sách (Checkbox) */}
      <SidebarSection title="Chính sách & Khác">
        <div className="grid gap-3">
          {LUA_CHON_CHINH_SACH.map((policy) => (
            <label key={policy.field} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={filters[policy.field]}
                onChange={() => handleCheckboxChange(policy.field, policy.field, false)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
              />
              <span className="text-sm text-slate-700">{policy.label}</span>
            </label>
          ))}
        </div>
      </SidebarSection>
    </div>
  );
}

export default BoLocBenTrai;
