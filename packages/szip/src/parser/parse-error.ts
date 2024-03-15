export function parseError(message: string) {
  if (message.startsWith('Command failed with')) {
    message = message.split('\n').slice(2).join('\n');
  }

  message = message.trim();

  const isMultiLine = message.includes('\n\n\n');

  if (isMultiLine) {
    const errors = message.split('\n\n');
    message = errors[0];
  }

  message = message.replaceAll('\n', ' ');

  return message;
}
