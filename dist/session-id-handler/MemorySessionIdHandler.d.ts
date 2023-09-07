import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler';
export default class MemorySessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
    private sessionId?;
    private sessionTimeout;
    protected getSessionId(): string | undefined;
    protected setSessionId(sessionId: string): void;
    protected getTimeout(): number;
    protected setTimeout(timeout: number): void;
}
