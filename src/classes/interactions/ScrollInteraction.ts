import { BaseInteraction } from './BaseInteraction';
import { IScrollData } from '../../interfaces/IScrollData';

export class ScrollInteraction extends BaseInteraction {
    private collectedProperties: IScrollData;

    constructor(scrollPercentage: number, event: Event) {
        super(event);
        this.collectedProperties = {
            label: `Scroll distance ${scrollPercentage}%`,
            action: "scroll"
        };
    }

    /**
     * Not implemented.
     */
    protected populateData(): void {
        return
    }
}