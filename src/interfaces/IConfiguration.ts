import { ITracker } from './ITracker';
import { IPrivacySettings } from './IPrivacySettings';
import { IDebounceEvent } from './IDebounceEvent';
import { IContainer } from './IContainer';
import { ITarget } from './ITarget';

/**
 * Configuration properties.
 */
export interface IConfiguration {
    template: string;
    isDebug: boolean;
    privacy: IPrivacySettings;
    debounce: IDebounceEvent | IDebounceEvent[] | null;
    targets: ITarget[];
    containers: IContainer[];
    consumers: ITracker[];
    scrollDistances: number[];
}