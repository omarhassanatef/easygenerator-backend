import { ConsoleLogger } from "@nestjs/common";
import { IncomingHttpHeaders } from "http";
import { getContext } from "../contexts/app.context";

export type LogMessage = {
  method?: { name: string; phase?: "Start" | "Mid" | "End" };
  message?: string;
  headers?: IncomingHttpHeaders;
  data?: object;
  [key: string]: unknown;
};

export class AppLogger extends ConsoleLogger {
  constructor(className: string) {
    super(className);
  }

  log(message: LogMessage | string) {
    super.log(this.toMessage(message));
  }

  error(message: (LogMessage & { error?: unknown }) | string, error?: unknown) {
    if (typeof message === "string") {
      super.error(this.toMessage({ message, error }));
    } else {
      super.error(this.toMessage(message));
    }
  }

  warn(message: (LogMessage & { error?: unknown }) | string) {
    super.warn(this.toMessage(message));
  }

  debug(message: LogMessage | string) {
    super.debug(this.toMessage(message));
  }

  verbose(message: LogMessage | string) {
    super.verbose(this.toMessage(message));
  }

  fatal(message: LogMessage | string) {
    super.fatal(this.toMessage(message));
  }

  private toMessage(message: LogMessage | string) {
    const context = getContext();

    if (typeof message === "string") {
      return {
        message,
        userId: context.userId,
        traceId: context.traceId,
        requestId: context.requestId,
      };
    }

    return {
      userId: context.userId,
      traceId: context.traceId,
      requestId: context.requestId,
      ...message,
    };
  }
}
