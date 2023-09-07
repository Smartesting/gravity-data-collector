import CollectorWrapper from './CollectorWrapper';
import { CollectorOptions, SessionTraitValue } from '../types';
export default class GravityCollector {
    collectorWrapper: CollectorWrapper | undefined;
    constructor(collectorWrapper: CollectorWrapper);
    static get instance(): any;
    static init(options?: Partial<CollectorOptions>): void;
    static identifySession(traitName: string, traitValue: SessionTraitValue): void;
}
