import { AsyncLocalStorage } from "async_hooks";

export type AppContext = {
  userId?: string;
  traceId?: string;
  requestId?: string;
};

const asyncLocalStorage = new AsyncLocalStorage<AppContext>();

export function getContext(): AppContext {
  return asyncLocalStorage.getStore() || {};
}

export function setContext(context: AppContext): void {
  asyncLocalStorage.enterWith(context);
}

export function runWithContext<T>(context: AppContext, callback: () => T): T {
  return asyncLocalStorage.run(context, callback);
}
