import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler';
export default class SessionStorageSessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
    protected getSessionId(): string | undefined;
    protected setSessionId(sessionId: string): void;
    protected getTimeout(): number;
    protected setTimeout(timeout: number): void;
}
