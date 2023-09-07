import { SessionUserAction, UserAction } from '../types';
import UserActionsHistory from '../user-actions-history/UserActionsHistory';
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler';
import IUserActionHandler from './IUserActionHandler';
export default class UserActionHandler implements IUserActionHandler {
    private readonly sessionIdHandler;
    private readonly requestInterval;
    private readonly output;
    private readonly onPublish?;
    private readonly userActionHistory?;
    private readonly buffer;
    private readonly timer?;
    constructor(sessionIdHandler: ISessionIdHandler, requestInterval: number, output: (sessionActions: SessionUserAction[]) => void, onPublish?: ((sessionActions: SessionUserAction[]) => void) | undefined, userActionHistory?: UserActionsHistory | undefined);
    handle(action: UserAction): void;
    flush(): void;
    private toSessionUserAction;
}
