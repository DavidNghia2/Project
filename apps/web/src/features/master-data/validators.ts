import type {
  Warehouse,
  WarehouseFormData,
  Category,
  CategoryFormData,
  UnitOfMeasure,
  UnitFormData,
  Supplier,
  SupplierFormData,
  ValidationErrors,
} from './types';

function checkUnique<T extends { id: string }>(
  items: T[],
  currentId: string | undefined,
  predicate: (item: T) => boolean
): boolean {
  return items.some((item) => item.id !== currentId && predicate(item));
}

export function validateWarehouse(
  form: WarehouseFormData,
  existing: Warehouse[],
  currentId?: string
): ValidationErrors {
  const errors: ValidationErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();

  if (!code) {
    errors.code = 'Mã kho không được để trống';
  } else if (code.length < 3) {
    errors.code = 'Mã kho phải có ít nhất 3 ký tự';
  } else if (checkUnique(existing, currentId, (w) => w.code.toUpperCase() === code)) {
    errors.code = `Mã kho "${code}" đã tồn tại trong hệ thống`;
  }

  if (!name) {
    errors.name = 'Tên kho không được để trống';
  } else if (name.length < 3) {
    errors.name = 'Tên kho phải có ít nhất 3 ký tự';
  } else if (checkUnique(existing, currentId, (w) => w.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = `Tên kho "${name}" đã được sử dụng`;
  }

  if (!form.region.trim()) {
    errors.region = 'Vui lòng chọn khu vực địa lý';
  }

  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = 'Địa chỉ kho phải có ít nhất 5 ký tự';
  }

  if (!form.manager.trim() || form.manager.trim().length < 2) {
    errors.manager = 'Tên người phụ trách không được để trống';
  }

  if (Number.isNaN(form.staffCount) || form.staffCount < 0) {
    errors.staffCount = 'Số nhân sự phải lớn hơn hoặc bằng 0';
  }

  if (Number.isNaN(form.capacityPercent) || form.capacityPercent < 0 || form.capacityPercent > 100) {
    errors.capacityPercent = 'Tỷ lệ lấp đầy phải từ 0% đến 100%';
  }

  return errors;
}

export function validateCategory(
  form: CategoryFormData,
  existing: Category[],
  currentId?: string
): ValidationErrors {
  const errors: ValidationErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();

  if (!code) {
    errors.code = 'Mã danh mục không được để trống';
  } else if (code.length < 3) {
    errors.code = 'Mã danh mục phải có ít nhất 3 ký tự';
  } else if (checkUnique(existing, currentId, (c) => c.code.toUpperCase() === code)) {
    errors.code = `Mã danh mục "${code}" đã tồn tại`;
  }

  if (!name) {
    errors.name = 'Tên danh mục không được để trống';
  } else if (name.length < 2) {
    errors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
  } else if (checkUnique(existing, currentId, (c) => c.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = `Tên danh mục "${name}" đã tồn tại`;
  }

  if (!form.parentGroup.trim()) {
    errors.parentGroup = 'Vui lòng chọn nhóm ngành chính';
  }

  return errors;
}

export function validateUnit(
  form: UnitFormData,
  existing: UnitOfMeasure[],
  currentId?: string
): ValidationErrors {
  const errors: ValidationErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();
  const symbol = form.symbol.trim();

  if (!code) {
    errors.code = 'Mã đơn vị tính không được để trống';
  } else if (code.length < 2) {
    errors.code = 'Mã đơn vị tính phải có ít nhất 2 ký tự';
  } else if (checkUnique(existing, currentId, (u) => u.code.toUpperCase() === code)) {
    errors.code = `Mã đơn vị "${code}" đã tồn tại`;
  }

  if (!name) {
    errors.name = 'Tên đơn vị tính không được để trống';
  } else if (name.length < 2) {
    errors.name = 'Tên đơn vị tính phải có ít nhất 2 ký tự';
  } else if (checkUnique(existing, currentId, (u) => u.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = `Tên đơn vị "${name}" đã tồn tại`;
  }

  if (!symbol) {
    errors.symbol = 'Ký hiệu viết tắt không được để trống';
  } else if (checkUnique(existing, currentId, (u) => u.symbol.trim().toLowerCase() === symbol.toLowerCase())) {
    errors.symbol = `Ký hiệu "${symbol}" đã được sử dụng cho đơn vị khác`;
  }

  return errors;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSupplier(
  form: SupplierFormData,
  existing: Supplier[],
  currentId?: string
): ValidationErrors {
  const errors: ValidationErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();

  if (!code) {
    errors.code = 'Mã nhà cung cấp không được để trống';
  } else if (code.length < 3) {
    errors.code = 'Mã nhà cung cấp phải có ít nhất 3 ký tự';
  } else if (checkUnique(existing, currentId, (s) => s.code.toUpperCase() === code)) {
    errors.code = `Mã nhà cung cấp "${code}" đã tồn tại`;
  }

  if (!name) {
    errors.name = 'Tên nhà cung cấp không được để trống';
  } else if (name.length < 3) {
    errors.name = 'Tên nhà cung cấp phải có ít nhất 3 ký tự';
  } else if (checkUnique(existing, currentId, (s) => s.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = `Tên nhà cung cấp "${name}" đã tồn tại`;
  }

  if (!form.contactPerson.trim() || form.contactPerson.trim().length < 2) {
    errors.contactPerson = 'Tên người liên hệ không được để trống';
  }

  if (!form.phone.trim() || form.phone.trim().length < 4) {
    errors.phone = 'Thông tin điện thoại liên hệ phải có ít nhất 4 ký tự';
  }

  if (!email) {
    errors.email = 'Email liên hệ không được để trống';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Định dạng email không hợp lệ (ví dụ: contact@company.example)';
  } else if (checkUnique(existing, currentId, (s) => s.email.trim().toLowerCase() === email)) {
    errors.email = `Email "${email}" đã thuộc về một nhà cung cấp khác`;
  }

  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = 'Địa chỉ nhà cung cấp phải có ít nhất 5 ký tự';
  }

  return errors;
}
