import { Archive } from 'node-archive';
import { resolve } from 'node:path';
import { SZip } from 'szip';
import { log } from '@tests/log';
import { expect } from 'chai';
import { createReadStream, createWriteStream, promises } from 'node:fs';
import { createTar, ROOT_DIR } from './utils';

describe('SZip - Compress', () => {
  describe('Using Stream', () => {
    it('compress data from read stream', async () => {
      const tarName = resolve(ROOT_DIR, 'source.tar');
      const { data } = await createTar(tarName);
      expect(data).to.contain('Everything is Ok');

      const filename = resolve(ROOT_DIR, 'source.tar.xz');

      const { data: output } = await SZip.compress(filename, createReadStream(tarName), {
        type: 'xz',
        cwd: ROOT_DIR,
        raw: true
      });

      log(output);

      await promises.unlink(filename);
      await promises.unlink(tarName);
    });

    it('compress content to write stream', async () => {
      const tarName = resolve(ROOT_DIR, 'source.tar');
      const { data } = await createTar(tarName);
      expect(data).to.contain('Everything is Ok');

      const filename = resolve(ROOT_DIR, 'source.tar.xz');

      const stream = createWriteStream(filename);

      const { data: output } = await SZip.compress(undefined, createReadStream(tarName), {
        type: 'xz',
        cwd: ROOT_DIR,
        stdout: stream
      });

      expect(output).to.be.true;

      await promises.unlink(filename);
      await promises.unlink(tarName);
    });
  });

  it('compress a string', async () => {
    const tarName = resolve(ROOT_DIR, 'source.tar');

    const { data } = await createTar(tarName);

    expect(data).to.contain('Everything is Ok');

    // Read the source.tar and pass it to compress
    const content = await promises.readFile(tarName);

    const filename = resolve(ROOT_DIR, 'source.tar.xz');

    const output = await SZip.compress(filename, content, {
      type: 'xz',
      cwd: ROOT_DIR
    });

    log(output);

    expect(output).to.have.property('data');
    expect(output.data).to.have.property('size');
    expect(output.data).to.have.property('path');

    await promises.unlink(filename);
    await promises.unlink(tarName);
  });
});
