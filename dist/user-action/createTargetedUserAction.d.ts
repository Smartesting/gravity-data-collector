import { CreateSelectorsOptions, TargetedUserAction, UserActionType } from '../types';
interface CreateTargetedUserActionOptions {
    selectorsOptions: Partial<CreateSelectorsOptions> | undefined;
    excludeRegex: RegExp | null;
    customSelector: string | undefined;
    document: Document;
}
export declare function createTargetedUserAction(event: Event, type: UserActionType, customOptions?: Partial<CreateTargetedUserActionOptions>): TargetedUserAction | null;
export {};
