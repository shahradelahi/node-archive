export function getBooleanEnv(name: string) {
  const env = process.env[name];
  if (env === undefined) {
    return;
  }
  switch (env.toLowerCase()) {
    case '':
    case '0':
    case 'false':
    case 'off':
      return false;
    default:
      return true;
  }
}
