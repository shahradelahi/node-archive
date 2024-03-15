import { log } from '@tests/log';
import { promises } from 'node:fs';
import { resolve } from 'node:path';
import { SZip } from 'szip';
import { createTar, createTar7z, createZip, ROOT_DIR } from './utils';

describe('SZip - List', () => {
  describe('Technical', () => {
    it('list the info of a 7z file', async () => {
      const filename = resolve(ROOT_DIR, 'source.tar.7z');
      await createTar7z(filename);

      const list = await SZip.list(filename, {
        raw: true
      });

      log(list);

      await promises.unlink(filename);
    });

    it('list the info of a tar file', async () => {
      await createTar('source.tar');

      const list = await SZip.list('source.tar', {
        raw: true
      });
      log(list);

      await promises.unlink('source.tar');
    });

    it('list the info of a zip file', async () => {
      const filename = 'source.zip';
      await createZip(filename);

      const list = await SZip.list(filename, {
        raw: true
      });
      log(list);

      await promises.unlink(filename);
    });
  });
});
