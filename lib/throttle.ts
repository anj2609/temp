export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number
): (...args: A) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: A | null = null;

  const invoke = () => {
    last = Date.now();
    timer = null;
    if (pending) {
      fn(...pending);
      pending = null;
    }
  };

  return (...args: A) => {
    const elapsed = Date.now() - last;
    pending = args;
    if (elapsed >= ms) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      invoke();
    } else if (!timer) {
      timer = setTimeout(invoke, ms - elapsed);
    }
  };
}
