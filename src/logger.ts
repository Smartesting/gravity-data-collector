import LoggerWrapper from "./lib/LoggerWrapper"

export default class GravityLogger {
    loggerWrapper: LoggerWrapper | undefined

    constructor(loggerWrapper: LoggerWrapper) {
        this.loggerWrapper = loggerWrapper
    }

    static init(authKey: string, options?: TLoggerOptions) {
        if(!window) {
            throw "GravityLogger needs a `window` instance in order to work"
        }

        (<any>window)._GravityLogger = new GravityLogger(new LoggerWrapper(authKey, options))
    }

    static get instance() {
        return (<any>window)._GravityLogger
    }
}