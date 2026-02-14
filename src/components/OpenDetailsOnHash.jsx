'use client';

import { useEffect } from 'react';

export default function OpenDetailsOnHash({ anchorId, detailsId }) {
  useEffect(() => {
    if (!anchorId || !detailsId) return;

    const anchorHash = `#${String(anchorId).replace(/^#/, '')}`;

    const openIfNeeded = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash !== anchorHash) return;

      const detailsEl = document.getElementById(detailsId);
      if (detailsEl && detailsEl.tagName === 'DETAILS') {
        detailsEl.open = true;
      }

      const anchorEl = document.getElementById(String(anchorId).replace(/^#/, ''));
      if (anchorEl) {
        anchorEl.scrollIntoView({ block: 'start' });
      }
    };

    openIfNeeded();
    window.addEventListener('hashchange', openIfNeeded);
    return () => window.removeEventListener('hashchange', openIfNeeded);
  }, [anchorId, detailsId]);

  return null;
}
