/* Tiny classname combiner — filters falsy, joins the rest. */
export default function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}