import { IBaseInteraction } from "../../interfaces/IBaseInteraction";

export abstract class BaseInteraction implements IBaseInteraction {
    public eventType: string;

    constructor(e: Event) {
        this.eventType = e.type;
    }
    protected abstract populateData(): void;
}