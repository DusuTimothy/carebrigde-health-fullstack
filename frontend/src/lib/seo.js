import { useEffect } from 'react';

const SITE = 'Carebridge Health';
const DEFAULT_IMAGE = '/images/health/doctor-team.jpg';

function setMeta(keyAttr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${keyAttr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(keyAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/* Sets the document title plus description / Open Graph / Twitter meta tags
   so every route can be shared, found and previewed properly. */
export function usePageMeta({ title, description = '', image } = {}) {
  useEffect(() => {
    const full = title ? `${title} | ${SITE}` : SITE;
    document.title = full;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', image ?? DEFAULT_IMAGE);
    setMeta('property', 'og:url', window.location.href);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', full);
    setMeta('name', 'twitter:description', description);
  }, [title, description, image]);
}