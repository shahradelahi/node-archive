import { SZip } from 'szip';
import { log } from '@tests/log';
import { expect } from 'chai';
import { createReadStream, promises } from 'node:fs';
import { createTar } from './utils';

describe('SZip - Compress', () => {
  it('compress a string', async () => {
    const stdout = await createTar();
    expect(stdout).to.contain('Everything is Ok');

    // Read the source.tar and pass it to compress
    const content = await promises.readFile('source.tar');

    const output = await SZip.compress('source.tar.xz', content, {
      type: 'xz'
    });

    log(output);

    await promises.unlink('source.tar.xz');
    await promises.unlink('source.tar');
  });

  it('compress a readable stream', async () => {
    const stdout = await createTar();
    expect(stdout).to.contain('Everything is Ok');

    const output = await SZip.compress('source.tar.xz', createReadStream('source.tar'), {
      type: 'xz',
      password: 'password'
    });

    log(output);

    await promises.unlink('source.tar.xz');
  });

  it('compress and add password', async () => {
    const tarName = 'secure.tar';
    const tarOuts = await createTar(tarName, Buffer.from('password').toString('base64'));
    expect(tarOuts).to.contain('Everything is Ok');

    const filename = 'secure.tar.7z';

    const output = await SZip.encrypt(filename, createReadStream('source.tar'), {
      password: 'password'
    });

    log(output);

    // const hasPass = await Archive.hasPassword('source.tar.xz');
    // console.log(hasPass);

    await promises.unlink(filename);
    await promises.unlink(tarName);
  });
});
