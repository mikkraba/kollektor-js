import { CustomValueMethod } from './../types/CustomValueMethod';

export interface ITarget {
    events: string[] | string;
    name: string;
    selector: string;
    labelAttribute?: string | CustomValueMethod;
    identifierAttribute?: string | CustomValueMethod;
    condition?: ((element: HTMLElement) => boolean);
}