export function runAfterPaint(task: () => void | Promise<void>) {
  void Promise.resolve().then(task);
}
