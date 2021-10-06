// Generated by dts-bundle v0.7.3

declare module 'kollektor-js' {
    import { IOptions } from 'kollektor-js/interfaces/IOptions';
    import './polyfills/polyfills.all.js';
    class Kollektor {
        static getInstance(options?: IOptions): Kollektor | void;
        track(): void;
    }
    export const register: (options: IOptions) => void | Kollektor;
    export default register;
}

declare module 'kollektor-js/interfaces/IOptions' {
    import { ConfigurationTemplate } from 'kollektor-js/types/ConfigurationTemplate';
    import { IPrivacySettings } from 'kollektor-js/interfaces/IPrivacySettings';
    import { ITracker } from 'kollektor-js/interfaces/ITracker';
    import { IDebounceEvent } from 'kollektor-js/interfaces/IDebounceEvent';
    import { ITarget } from 'kollektor-js/interfaces/ITarget';
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
}

declare module 'kollektor-js/types/ConfigurationTemplate' {
    export type ConfigurationTemplate = "custom" | "default" | "bootstrap4";
}

declare module 'kollektor-js/interfaces/IPrivacySettings' {
    export interface IPrivacySettings {
        masking: boolean;
        limit: number;
        excludedSelectors: string[];
    }
}

declare module 'kollektor-js/interfaces/ITracker' {
    import { ITrackerMap } from "kollektor-js/interfaces/ITrackerMap";
    export interface ITracker {
        name: string;
        map: ITrackerMap;
        events: "all" | string[];
        handler: (event: string, mapObj: object) => void;
    }
}

declare module 'kollektor-js/interfaces/IDebounceEvent' {
    export interface IDebounceEvent {
        event: "all" | string;
        delay: number;
    }
}

declare module 'kollektor-js/interfaces/ITarget' {
    import { CustomValueMethod } from 'kollektor-js/types/CustomValueMethod';
    export interface ITarget {
        events: string[] | string;
        name: string;
        selector: string;
        labelAttribute?: string | CustomValueMethod;
        identifierAttribute?: string | CustomValueMethod;
        condition?: ((element: HTMLElement) => boolean);
    }
}

declare module 'kollektor-js/interfaces/ITrackerMap' {
    export interface ITrackerMap {
        [key: string]: string;
    }
}

declare module 'kollektor-js/types/CustomValueMethod' {
    export type CustomValueMethod = (element: HTMLElement) => string;
}

