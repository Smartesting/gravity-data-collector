import { SessionUserAction } from '../types';
export interface AddSessionUserActionsResponse {
    error: AddSessionUserActionsError | null;
}
export declare enum AddSessionUserActionsError {
    incorrectSource = "incorrect_source",
    conflict = "conflict",
    notUUID = "not_a_uuid",
    collectionNotFound = "collection_not_found",
    domainNotFound = "domain_not_found",
    domainExpired = "domain_expired",
    invalidFormat = "invalid_format"
}
export declare function defaultSessionUserActionSender(authKey: string, gravityServerUrl: string, successCallback?: (payload: any) => void, errorCallback?: (statusCode: number, reason: AddSessionUserActionsError) => void): (sessionActions: SessionUserAction[]) => Promise<void>;
export declare function debugSessionUserActionSender(maxDelay: number, output?: (args: any) => void): (sessionActions: SessionUserAction[]) => void;
export declare function sendSessionUserActions(authKey: string, gravityServerUrl: string, sessionActions: readonly SessionUserAction[], source?: string | null, successCallback?: (payload: any) => void, errorCallback?: (statusCode: number, reason: AddSessionUserActionsError) => void, fetch?: typeof globalThis.fetch): Promise<AddSessionUserActionsResponse>;
