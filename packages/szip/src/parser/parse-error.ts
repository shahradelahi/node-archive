export function parseError(message: string) {
  const isMultiLine = message.includes('\n\n');

  if (isMultiLine) {
    const errors = message.split('\n\n');
    message = errors[0];
  }

  return message;
}
