import { SessionTraits } from '../types';
export interface IdentifySessionResponse {
    error: IdentifySessionError | null;
}
export declare enum IdentifySessionError {
    accessDenied = "no_access",
    collectionNotFound = "collection_not_found",
    sessionNotFound = "session_not_found",
    domainNotFound = "domain_not_found",
    domainExpired = "domain_expired",
    invalidField = "invalid_field",
    incorrectSource = "incorrect_source",
    notUUID = "not_a_uuid"
}
export declare function defaultSessionTraitSender(authKey: string, gravityServerUrl: string, successCallback?: () => void, errorCallback?: (statusCode: number, reason: IdentifySessionError) => void): (sessionId: string, traits: SessionTraits) => Promise<IdentifySessionResponse>;
export declare function debugSessionTraitSender(maxDelay: number, output?: (args: any) => void): (_sessionId: string, traits: SessionTraits) => void;
export declare function sendSessionTraits(authKey: string, gravityServerUrl: string, sessionId: string, sessionTraits: SessionTraits, source?: string | null, successCallback?: () => void, errorCallback?: (statusCode: number, error: IdentifySessionError) => void, fetch?: typeof globalThis.fetch): Promise<IdentifySessionResponse>;
