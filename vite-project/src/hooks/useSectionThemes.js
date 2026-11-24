// src/hooks/useSectionTheme.js  (replaces useSectionThemes.js)
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useSectionTheme(ref, theme) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => { document.documentElement.dataset.theme = theme; };
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 60%',
      onEnter: apply,
      onEnterBack: apply,
    });
    ScrollTrigger.refresh();

    return () => trigger.kill();
  }, [ref, theme]);
}