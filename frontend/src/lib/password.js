/* Pure helpers for the password show/hide control. Kept free of JSX so the
   toggle behaviour and accessible labels can be unit-tested with `node --test`. */

export const passwordInputType = (visible) => (visible ? 'text' : 'password');

export const togglePasswordVisibility = (visible) => !visible;

export const passwordToggleLabel = (visible, fieldLabel = 'password') =>
  `${visible ? 'Hide' : 'Show'} ${String(fieldLabel).toLowerCase()}`;

export default { passwordInputType, togglePasswordVisibility, passwordToggleLabel };
