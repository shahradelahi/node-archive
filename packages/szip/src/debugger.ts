export function debug(...args: any[]) {
  if (_debugger) {
    _debugger(...args);
  }
}

let _debugger: (...args: any[]) => void;

// Add debug
import('debug')
  .then((pkg) => {
    if (pkg) {
      _debugger = pkg.default('SZip');
    }
  })
  .catch(() => {});
