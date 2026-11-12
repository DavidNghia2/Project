import { evaluatePasswordPolicy, isValidEmailFormat } from '../../lib/auth';

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateLoginFields(email: string, password: string): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    errors.email = 'auth.errors.emailRequired';
  } else if (!isValidEmailFormat(normalizedEmail)) {
    errors.email = 'auth.errors.invalidEmail';
  }

  if (!password) {
    errors.password = 'auth.errors.passwordRequired';
  }

  return errors;
}

export function validateRegisterFields(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  const trimmedName = input.fullName.trim();
  const normalizedEmail = input.email.trim();

  if (!trimmedName) {
    errors.fullName = 'auth.errors.fullNameRequired';
  } else if (trimmedName.length < 2) {
    errors.fullName = 'auth.errors.fullNameMin';
  }

  if (!normalizedEmail) {
    errors.email = 'auth.errors.emailRequired';
  } else if (!isValidEmailFormat(normalizedEmail)) {
    errors.email = 'auth.errors.invalidEmail';
  }

  if (!input.password) {
    errors.password = 'auth.errors.passwordRequired';
  } else if (!evaluatePasswordPolicy(input.password).isValid) {
    errors.password = 'auth.errors.weakPassword';
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = 'auth.errors.confirmPasswordRequired';
  } else if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'auth.errors.passwordMismatch';
  }

  return errors;
}
