import { UserAction } from '../types';
export default interface IUserActionHandler {
    handle: (action: UserAction) => void;
    flush: () => void;
}
export declare class NopUserActionHandler implements IUserActionHandler {
    handle(): void;
    flush(): void;
}
