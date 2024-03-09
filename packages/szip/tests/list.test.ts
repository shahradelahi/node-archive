import { SZip } from 'szip';
import { log } from '@tests/log';
import { promises } from 'node:fs';
import { createTar, createTar7z, createZip } from './utils';

describe('SZip - List', () => {
  it('list the info of a 7z file', async () => {
    await createTar7z();
    const list = await SZip.list('secure.tar.7z', {
      technicalInfo: true,
      raw: true
    });
    log(list);
    await promises.unlink('secure.tar.7z');
  });

  it('list the info of a tar file', async () => {
    await createTar('source.tar');

    const list = await SZip.list('source.tar', {
      technicalInfo: true,
      raw: true
    });
    log(list);

    await promises.unlink('source.tar');
  });

  it('list the info of a zip file', async () => {
    const filename = 'source.zip';
    await createZip(filename);

    const list = await SZip.list(filename, {
      technicalInfo: true,
      raw: true
    });
    log(list);

    await promises.unlink(filename);
  });
});
