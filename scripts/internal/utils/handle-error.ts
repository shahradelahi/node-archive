export function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(`**ERROR** ${error.message}`);
    process.exit(1);
  }

  console.error(`**ERROR** ${error}`);
  process.exit(1);
}
