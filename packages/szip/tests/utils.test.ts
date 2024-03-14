import { waitUtilOpenStream } from '@szip/utils/wait';
import { expect } from 'chai';
import { createWriteStream, promises } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT_DIR } from './utils';

describe('Stream', () => {
  it('should create write stream and wait until it is open', async () => {
    const stream = createWriteStream(resolve(ROOT_DIR, 'test.txt'));

    await waitUtilOpenStream(stream);

    expect(stream.writable).to.be.true;

    stream.write('Hello World');

    stream.end();

    await promises.unlink(resolve(ROOT_DIR, 'test.txt'));
  });
});
