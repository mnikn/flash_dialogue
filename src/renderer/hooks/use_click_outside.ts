import { useEffect } from 'react';

export default function useClickOutside(
  dom: HTMLElement | null,
  callback: () => void,
) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (dom && !dom.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dom, callback]);
}
