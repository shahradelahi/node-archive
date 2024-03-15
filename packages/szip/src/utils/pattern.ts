export function isRecurse(path: string) {
  return path.includes('**');
}

export function addPattern(mode: 'x' | 'i', path: string, recurse: boolean) {
  return `-${mode}${recurse ? 'r' : ''}!${path}`;
}

export function isWildcard(path: string) {
  return path.includes('*');
}
