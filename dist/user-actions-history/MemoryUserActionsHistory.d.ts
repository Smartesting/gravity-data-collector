import UserActionsHistory from './UserActionsHistory';
import { UserAction } from '../types';
export default class MemoryUserActionsHistory implements UserActionsHistory {
    private readonly historySize;
    private readonly userActionsHistory;
    constructor(historySize?: number);
    getLast(): UserAction;
    getUserActionsHistory(): UserAction[];
    push(userAction: UserAction): void;
}
