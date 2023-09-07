export default interface ISessionIdHandler {
    isSet: () => boolean;
    get: () => string;
    generateNewSessionId: () => void;
}
export declare abstract class BaseSessionIdHandler implements ISessionIdHandler {
    private readonly makeSessionId;
    private readonly sessionDuration;
    constructor(makeSessionId: () => string, sessionDuration: number);
    get(): string;
    isSet(): boolean;
    generateNewSessionId(): void;
    protected abstract getSessionId(): string | undefined;
    protected abstract setSessionId(sessionId: string): void;
    protected abstract getTimeout(): number;
    protected abstract setTimeout(timeout: number): void;
}
