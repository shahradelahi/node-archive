import { execa, ExecaError, ExecaReturnValue, Options } from 'execa';
import { SafeReturn } from 'szip';

export async function safeExec(
  file: string,
  args: string[],
  options: Options
): Promise<SafeReturn<ExecaReturnValue, ExecaError>> {
  return execa(file, args, options)
    .catch((error) => error)
    .then((result) => (result instanceof Error ? { error: result } : { data: result }));
}
