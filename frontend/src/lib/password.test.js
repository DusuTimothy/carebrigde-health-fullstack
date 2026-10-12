import test from 'node:test';
import assert from 'node:assert/strict';
import {
  passwordInputType,
  togglePasswordVisibility,
  passwordToggleLabel,
} from './password.js';

test('password input switches between masked and revealed', () => {
  assert.equal(passwordInputType(false), 'password');
  assert.equal(passwordInputType(true), 'text');
});

test('toggling flips visibility and is independent per call', () => {
  assert.equal(togglePasswordVisibility(false), true);
  assert.equal(togglePasswordVisibility(true), false);
});

test('toggle label reflects the action and target field', () => {
  assert.equal(passwordToggleLabel(false, 'Password'), 'Show password');
  assert.equal(passwordToggleLabel(true, 'Password'), 'Hide password');
  assert.equal(passwordToggleLabel(false, 'Confirm password'), 'Show confirm password');
  assert.equal(passwordToggleLabel(true, 'New password'), 'Hide new password');
});
