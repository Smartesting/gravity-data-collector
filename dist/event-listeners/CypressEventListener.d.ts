import { CypressObject } from '../types';
import { IEventListener } from './IEventListener';
import IUserActionHandler from '../user-action/IUserActionHandler';
export default class CypressEventListener implements IEventListener {
    private readonly cypress;
    private readonly userActionHandler;
    private readonly listeners;
    private readonly testAfterRunListener;
    constructor(cypress: CypressObject, userActionHandler: IUserActionHandler);
    init(): void;
    terminate(): void;
}
