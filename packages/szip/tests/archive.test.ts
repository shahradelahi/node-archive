import { log } from '@tests/log';
import { expect } from 'chai';
import { promises } from 'node:fs';
import { resolve } from 'node:path';
import { SZip } from 'szip';
import { ROOT_DIR } from './utils';

describe('SZip - Create Archive', () => {
  describe('Zip', () => {
    it('archive `src` and `dist` directory', async () => {
      const filename = resolve(ROOT_DIR, 'project.zip');

      const output = await SZip.add(filename, {
        include: ['src/*', 'dist/*'],
        type: 'zip',
        cwd: ROOT_DIR,
        raw: true
      });

      expect(output).to.have.property('data').that.is.a('string');
      expect(output.data).to.contain('Everything is Ok');

      await promises.unlink(filename);
    });

    it('archive `package.json` and `pnpm-lock.yaml`', async () => {
      const filename = resolve(ROOT_DIR, 'package.zip');

      const output = await SZip.add(filename, {
        include: ['package.json', 'pnpm-lock.yaml'],
        type: 'zip',
        cwd: ROOT_DIR,
        raw: true
      });

      log(output);

      await promises.unlink(filename);
    });
  });

  describe('Tar', () => {
    it('archive `src` directory', async () => {
      const filename = 'project.tar';

      const output = await SZip.add(filename, {
        include: ['src/*'],
        type: 'tar',
        cwd: ROOT_DIR,
        raw: true
      });

      log(output);

      await promises.unlink(resolve(ROOT_DIR, filename));
    });

    it('should archive `src` and then add `dist` directory to archive', async () => {
      const filename = resolve(ROOT_DIR, 'project.tar');

      const createdTar = await SZip.add(filename, {
        include: ['src/*'],
        type: 'tar',
        cwd: ROOT_DIR,
        raw: true
      });

      log(createdTar);

      const updatedTar = await SZip.add(filename, {
        include: ['dist/*'],
        type: 'tar',
        update: true, // Update the archive
        cwd: ROOT_DIR,
        raw: true
      });

      log(updatedTar);

      await promises.unlink(filename);
    });

    it('archive `package.json` and `pnpm-lock.yaml` then removes `package.json` from archive', async () => {
      const filename = resolve(ROOT_DIR, 'package.tar');

      const createdTar = await SZip.add(filename, {
        include: ['package.json', 'pnpm-lock.yaml'],
        type: 'tar',
        cwd: ROOT_DIR,
        raw: true
      });

      log(createdTar);

      const updatedTar = await SZip.del(filename, {
        exclude: ['package.json']
      });

      log(updatedTar);

      await promises.unlink(filename);
    });
  });

  describe('With password', () => {
    it('create a zip', async () => {
      const filename = resolve(ROOT_DIR, 'source.zip');

      const output = await SZip.add(filename, {
        include: ['src/*', 'dist/*'],
        type: 'zip',
        password: 'pa$$word @|',
        cwd: ROOT_DIR,
        raw: true
      });

      log(output);

      await promises.unlink(filename);
    });
  });
});
