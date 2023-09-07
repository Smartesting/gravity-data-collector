import { SessionTraits, SessionTraitValue } from '../types';
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler';
export default class SessionTraitHandler {
    private readonly sessionIdHandler;
    private readonly requestInterval;
    private readonly output;
    private buffer;
    private readonly timer?;
    constructor(sessionIdHandler: ISessionIdHandler, requestInterval: number, output: (sessionId: string, traits: SessionTraits) => void);
    handle(traitName: string, traitValue: SessionTraitValue): void;
    flush(): void;
}
