import { ConfigurationTemplate } from './../types/ConfigurationTemplate';
import { IPrivacySettings } from './IPrivacySettings';
import { ITracker } from './ITracker';
import { IDebounceEvent } from './IDebounceEvent';
import { ITarget } from './ITarget';

/**
 * Options properties.
 */
export interface IOptions {
    template?: ConfigurationTemplate;
    isDebug?: boolean;
    debounce?: IDebounceEvent | IDebounceEvent[] | null;
    privacy?: IPrivacySettings;
    targets?: ITarget[];
    containers?: ITarget[];
    consumers?: ITracker[];
    scrollDistances?: number[];
}