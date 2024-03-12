import { createReadStream, promises } from 'node:fs';
import { SZip } from '../src/szip';

export async function createTar(filename: string = 'source.tar', password?: string) {
  const output = await SZip.add(filename, {
    include: ['src/*', 'dist/*'],
    type: 'tar',
    password
  });

  return output;
}

export async function createTar7z(
  filename: string = 'secure.tar.7z',
  password: string = 'password'
) {
  const tarName = 'secure.tar';

  await createTar(tarName);

  const output = await SZip.encrypt(filename, createReadStream('secure.tar'), {
    password
  });

  await promises.unlink(tarName);

  return output;
}

export async function createZip(filename: string = 'source.zip', password?: string) {
  const output = await SZip.add(filename, {
    include: ['src/*', 'dist/*'],
    type: 'zip',
    password
  });

  return output;
}
