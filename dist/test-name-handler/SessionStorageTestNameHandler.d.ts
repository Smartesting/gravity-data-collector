import TestNameHandler from './TestNameHandler';
export default class SessionStorageTestNameHandler implements TestNameHandler {
    getCurrent(): string | null;
    getPrevious(): string | null;
    isNewTest(): boolean;
    refresh(): void;
}
