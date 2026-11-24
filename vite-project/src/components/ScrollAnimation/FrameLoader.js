export const TOTAL_FRAMES = 240; // kept in case other files import it

const DESKTOP = { folder: 'frames', count: 240 };
const MOBILE = { folder: 'frames-sm', count: 120 };
const MOBILE_MAX_WIDTH = 768;
const CONCURRENCY = 8;
const PRIORITY_FRAMES = 20;

export const getFramePaths = () => {
  const { folder, count } = window.innerWidth < MOBILE_MAX_WIDTH ? MOBILE : DESKTOP;
  return Array.from({ length: count }, (_, i) =>
    `${import.meta.env.BASE_URL}${folder}/frame${String(i + 1).padStart(4, '0')}.jpg`
  );
};

/**
 * Loads frames with a small concurrency pool, in order.
 * `frames` is filled in place, so callers can read it while loading continues.
 * onProgress: 0-100 for the first PRIORITY_FRAMES (what the loader waits for).
 * onPriorityReady: fires once those frames are decoded.
 */
export const preloadFrames = ({ paths, signal, onProgress, onPriorityReady }) => {
  const frames = new Array(paths.length).fill(null);
  const priorityTotal = Math.min(PRIORITY_FRAMES, paths.length);
  let cursor = 0;
  let priorityDone = 0;

  if (priorityTotal === 0) onPriorityReady?.();

  const loadOne = async (i) => {
    try {
      const res = await fetch(paths[i], { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bitmap = await createImageBitmap(await res.blob());
      if (signal?.aborted) bitmap.close();
      else frames[i] = bitmap;
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn(`Frame failed to load: ${paths[i]}`, err);
    }

    if (i < priorityTotal) {
      priorityDone++;
      onProgress?.(Math.round((priorityDone / priorityTotal) * 100));
      if (priorityDone === priorityTotal) onPriorityReady?.();
    }
  };

  const worker = async () => {
    while (cursor < paths.length) {
      await loadOne(cursor++);
    }
  };

  const promise = Promise.all(Array.from({ length: CONCURRENCY }, worker)).then(() => frames);
  return { frames, promise };
};

export const closeFrames = (frames) => {
  frames.forEach((frame) => frame?.close());
  frames.fill(null);
};