import type { Language } from '../../i18n';
import { translateKey } from '../../i18n/translate';
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
  currentId?: string,
  language: Language = 'vi'
): ValidationErrors {
  const errors: ValidationErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();

  if (!code) {
    errors.code = translateKey(language, 'masterData.validation.whCodeRequired');
  } else if (code.length < 3) {
    errors.code = translateKey(language, 'masterData.validation.whCodeMin');
  } else if (checkUnique(existing, currentId, (w) => w.code.toUpperCase() === code)) {
    errors.code = translateKey(language, 'masterData.validation.whCodeDup', { code });
  }

  if (!name) {
    errors.name = translateKey(language, 'masterData.validation.whNameRequired');
  } else if (name.length < 3) {
    errors.name = translateKey(language, 'masterData.validation.whNameMin');
  } else if (checkUnique(existing, currentId, (w) => w.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = translateKey(language, 'masterData.validation.whNameDup', { name });
  }

  if (!form.region.trim()) {
    errors.region = translateKey(language, 'masterData.validation.whRegionRequired');
  }

  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = translateKey(language, 'masterData.validation.whAddressMin');
  }

  if (!form.manager.trim() || form.manager.trim().length < 2) {
    errors.manager = translateKey(language, 'masterData.validation.whManagerRequired');
  }

  if (Number.isNaN(form.staffCount) || form.staffCount < 0) {
    errors.staffCount = translateKey(language, 'masterData.validation.whStaffMin');
  }

  if (Number.isNaN(form.capacityPercent) || form.capacityPercent < 0 || form.capacityPercent > 100) {
    errors.capacityPercent = translateKey(language, 'masterData.validation.whCapacityRange');
  }

  return errors;
}

export function validateCategory(
  form: CategoryFormData,
  existing: Category[],
  currentId?: string,
  language: Language = 'vi'
): ValidationErrors {
  const errors: ValidationErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();

  if (!code) {
    errors.code = translateKey(language, 'masterData.validation.catCodeRequired');
  } else if (code.length < 3) {
    errors.code = translateKey(language, 'masterData.validation.catCodeMin');
  } else if (checkUnique(existing, currentId, (c) => c.code.toUpperCase() === code)) {
    errors.code = translateKey(language, 'masterData.validation.catCodeDup', { code });
  }

  if (!name) {
    errors.name = translateKey(language, 'masterData.validation.catNameRequired');
  } else if (name.length < 2) {
    errors.name = translateKey(language, 'masterData.validation.catNameMin');
  } else if (checkUnique(existing, currentId, (c) => c.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = translateKey(language, 'masterData.validation.catNameDup', { name });
  }

  if (!form.parentGroup.trim()) {
    errors.parentGroup = translateKey(language, 'masterData.validation.catParentRequired');
  }

  return errors;
}

export function validateUnit(
  form: UnitFormData,
  existing: UnitOfMeasure[],
  currentId?: string,
  language: Language = 'vi'
): ValidationErrors {
  const errors: ValidationErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();
  const symbol = form.symbol.trim();

  if (!code) {
    errors.code = translateKey(language, 'masterData.validation.uomCodeRequired');
  } else if (code.length < 2) {
    errors.code = translateKey(language, 'masterData.validation.uomCodeMin');
  } else if (checkUnique(existing, currentId, (u) => u.code.toUpperCase() === code)) {
    errors.code = translateKey(language, 'masterData.validation.uomCodeDup', { code });
  }

  if (!name) {
    errors.name = translateKey(language, 'masterData.validation.uomNameRequired');
  } else if (name.length < 2) {
    errors.name = translateKey(language, 'masterData.validation.uomNameMin');
  } else if (checkUnique(existing, currentId, (u) => u.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = translateKey(language, 'masterData.validation.uomNameDup', { name });
  }

  if (!symbol) {
    errors.symbol = translateKey(language, 'masterData.validation.uomSymbolRequired');
  } else if (checkUnique(existing, currentId, (u) => u.symbol.trim().toLowerCase() === symbol.toLowerCase())) {
    errors.symbol = translateKey(language, 'masterData.validation.uomSymbolDup', { symbol });
  }

  return errors;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSupplier(
  form: SupplierFormData,
  existing: Supplier[],
  currentId?: string,
  language: Language = 'vi'
): ValidationErrors {
  const errors: ValidationErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();

  if (!code) {
    errors.code = translateKey(language, 'masterData.validation.supCodeRequired');
  } else if (code.length < 3) {
    errors.code = translateKey(language, 'masterData.validation.supCodeMin');
  } else if (checkUnique(existing, currentId, (s) => s.code.toUpperCase() === code)) {
    errors.code = translateKey(language, 'masterData.validation.supCodeDup', { code });
  }

  if (!name) {
    errors.name = translateKey(language, 'masterData.validation.supNameRequired');
  } else if (name.length < 3) {
    errors.name = translateKey(language, 'masterData.validation.supNameMin');
  } else if (checkUnique(existing, currentId, (s) => s.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = translateKey(language, 'masterData.validation.supNameDup', { name });
  }

  if (!form.contactPerson.trim() || form.contactPerson.trim().length < 2) {
    errors.contactPerson = translateKey(language, 'masterData.validation.supContactRequired');
  }

  if (!form.phone.trim() || form.phone.trim().length < 4) {
    errors.phone = translateKey(language, 'masterData.validation.supPhoneMin');
  }

  if (!email) {
    errors.email = translateKey(language, 'masterData.validation.supEmailRequired');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = translateKey(language, 'masterData.validation.supEmailInvalid');
  } else if (checkUnique(existing, currentId, (s) => s.email.trim().toLowerCase() === email)) {
    errors.email = translateKey(language, 'masterData.validation.supEmailDup', { email });
  }

  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = translateKey(language, 'masterData.validation.supAddressMin');
  }

  return errors;
}
