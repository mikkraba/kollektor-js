import { ITrackerMap } from "./ITrackerMap";

export interface ITracker {
    name: string;
    map: ITrackerMap;
    events: "all" | string[];
    handler: (event: string, mapObj: object) => void;
}