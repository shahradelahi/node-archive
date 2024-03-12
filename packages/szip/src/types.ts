export type SafeReturn<T, K = any> = Partial<{
  data: T;
  error: K;
}> &
  (
    | {
        data: T;
        error?: never;
      }
    | {
        data?: never;
        error: K;
      }
  );
