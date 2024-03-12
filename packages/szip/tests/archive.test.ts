import { log } from '@tests/log';
import { promises } from 'node:fs';
import { resolve } from 'node:path';
import { SZip } from 'szip';

describe('SZip - Create Archive', () => {
  describe('Zip', () => {
    it('archive `src` and `dist` directory', async () => {
      const filename = 'project.zip';

      const output = await SZip.add(filename, {
        include: ['src/*', 'dist/*'],
        type: 'zip'
      });

      log(output);

      await promises.unlink(resolve(filename));
    });

    it('archive `package.json` and `pnpm-lock.yaml`', async () => {
      const filename = 'package.zip';

      const output = await SZip.add(filename, {
        include: ['package.json', 'pnpm-lock.yaml'],
        type: 'zip'
      });

      log(output);

      await promises.unlink(resolve(filename));
    });
  });

  describe('Tar', () => {
    it('archive `src` directory', async () => {
      const filename = 'project.tar';

      const output = await SZip.add(filename, {
        include: ['src/*'],
        type: 'tar'
      });

      log(output);

      await promises.unlink(resolve(filename));
    });

    it('should archive `src` and then add `dist` directory to archive', async () => {
      const filename = 'project.tar';

      const createdTar = await SZip.add(filename, {
        include: ['src/*'],
        type: 'tar'
      });

      log(createdTar);

      const updatedTar = await SZip.add(filename, {
        include: ['dist/*'],
        type: 'tar'
      });

      log(updatedTar);

      await promises.unlink(resolve(filename));
    });

    it('archive `package.json` and `pnpm-lock.yaml` then removes `package.json` from archive', async () => {
      const filename = 'package.tar';

      const createdTar = await SZip.add(filename, {
        include: ['package.json', 'pnpm-lock.yaml'],
        type: 'tar'
      });

      log(createdTar);

      const updatedTar = await SZip.del(filename, {
        exclude: ['package.json']
      });

      log(updatedTar);

      await promises.unlink(resolve(filename));
    });
  });

  describe('With password', () => {
    it('create a zip', async () => {
      const filename = 'source.zip';

      const output = await SZip.add(filename, {
        include: ['src/*', 'dist/*'],
        type: 'zip',
        password: 'pa$$word @|'
      });

      log(output);

      await promises.unlink(resolve(filename));
    });
  });
});
