import { WritableStream } from '@/types';

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitUtilOpenStream(stream: WritableStream) {
  return new Promise((resolve) => stream.once('open', resolve));
}
