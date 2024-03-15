import { log } from '@tests/log';
import { expect } from 'chai';
import { promises } from 'node:fs';
import { resolve } from 'node:path';
import { SZip } from 'szip';
import { ROOT_DIR } from './utils';

describe('SZip - Delete', () => {
  it('should `Tar` project and then delete `*.test.ts` files', async () => {
    const filename = resolve(ROOT_DIR, 'project.tar');
    const createdTar = await SZip.add(filename, ['*'], {
      exclude: ['node_modules', 'project.tar'],
      type: 'tar',
      recurse: true,
      update: true,
      cwd: ROOT_DIR
    });

    log(createdTar);

    const deletedTar = await SZip.del(filename, ['*.test.ts'], {
      recurse: true,
      cwd: ROOT_DIR
    });

    log(deletedTar);
    expect(deletedTar.error).to.be.undefined;
    expect(deletedTar.data).to.be.an('object');
    expect(deletedTar.data).to.have.property('deleted').property('files').to.be.greaterThan(0);

    await promises.unlink(filename);
  });
});
