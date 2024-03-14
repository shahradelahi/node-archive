import { log } from '@tests/log';
import { expect } from 'chai';
import { createReadStream, promises } from 'node:fs';
import { resolve } from 'node:path';
import { SZip } from 'szip';
import { createTar, createTar7z, ROOT_DIR } from './utils';

describe('SZip - Encrypt Archive', () => {
  it('encrypt data from read stream', async () => {
    const tarName = resolve(ROOT_DIR, 'source.tar');
    const createdTar = await createTar(tarName);

    expect(createdTar, createdTar.error?.message).to.have.property('data');
    expect(createdTar.data).to.contain('Everything is Ok');

    const filename = resolve(ROOT_DIR, 'secure.tar.7z');

    const output = await SZip.encrypt(filename, createReadStream(tarName), {
      cwd: ROOT_DIR,
      password: '1234',
      raw: true
    });

    expect(output, output.error?.message).to.have.property('data');
    expect(output.data).to.contain('Everything is Ok');

    log(output.data);

    await promises.unlink(filename);
    await promises.unlink(tarName);
  });

  it('encrypt the an 7z archive', async () => {
    const tarName = resolve(ROOT_DIR, 'source.tar.7z');
    const createdTar = await createTar7z(tarName);

    expect(createdTar, createdTar.error?.message).to.have.property('data');
    expect(createdTar.data).to.contain('Everything is Ok');

    // Read the source.tar and pass it to compress
    const content = await promises.readFile(tarName);

    const filename = resolve(ROOT_DIR, 'secure.tar.7z');

    const output = await SZip.encrypt(filename, content, {
      cwd: ROOT_DIR,
      password: '1234'
    });

    log(output);

    expect(output).to.have.property('data').to.be.true;

    await promises.unlink(filename);
    await promises.unlink(tarName);
  });
});
