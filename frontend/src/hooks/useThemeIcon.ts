import { useEffect, useState } from 'react';

export function useThemeAwareIcon(defaultSrc: string, whiteSrc?: string): string {
  const [src, setSrc] = useState(defaultSrc);

  useEffect(() => {
    const root = document.documentElement;
    const resolveSrc = (): string => {
      return whiteSrc && root.dataset.theme === 'synthwave' ? whiteSrc : defaultSrc;
    };

    setSrc(resolveSrc());

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.type === 'attributes' && mutation.attributeName === 'data-theme')) {
        setSrc(resolveSrc());
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [defaultSrc, whiteSrc]);

  return src;
}
