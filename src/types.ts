import type { Readable as ReadableStream } from 'node:stream';

export type ContentLike = string | Buffer | ReadableStream;

export type { Readable as ReadableStream, Writable as WritableStream } from 'node:stream';
