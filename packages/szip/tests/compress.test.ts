import { resolve } from 'node:path';
import { SZip } from 'szip';
import { log } from '@tests/log';
import { expect } from 'chai';
import { createReadStream, promises } from 'node:fs';
import { createTar, ROOT_DIR } from './utils';

describe('SZip - Compress', () => {
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

    await promises.unlink(filename);
    await promises.unlink(tarName);
  });

  it('compress a readable stream', async () => {
    const tarName = resolve(ROOT_DIR, 'source.tar');
    const { data } = await createTar(tarName);
    expect(data).to.contain('Everything is Ok');

    const filename = resolve(ROOT_DIR, 'source.tar.xz');

    const output = await SZip.compress(filename, createReadStream(tarName), {
      type: 'xz',
      password: 'password',
      cwd: ROOT_DIR
    });

    log(output);

    await promises.unlink(filename);
    await promises.unlink(tarName);
  });

  it('compress and add password', async () => {
    const tarName = resolve(ROOT_DIR, 'secure.tar');
    const { data: tarOuts } = await createTar(tarName, Buffer.from('password').toString('base64'));
    expect(tarOuts).to.contain('Everything is Ok');

    const filename = resolve(ROOT_DIR, 'secure.tar.7z');

    const output = await SZip.encrypt(filename, createReadStream(tarName), {
      password: 'password',
      cwd: ROOT_DIR
    });

    log(output);

    // const hasPass = await Archive.hasPassword('source.tar.xz');
    // console.log(hasPass);

    await promises.unlink(filename);
    await promises.unlink(tarName);
  });
});
