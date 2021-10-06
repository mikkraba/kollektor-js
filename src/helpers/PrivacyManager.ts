import { IPrivacySettings } from '../interfaces/IPrivacySettings';

export class PrivacyManager {
    private settings: IPrivacySettings;

    constructor(settings: IPrivacySettings) {
        this.settings = settings;
    }

    /**
     * Replaces all digits of a number in a string with "n" character
     * when the number of digits is larger than set limit.
     * E.g. 'id_12345678' --> 'id_nnnnnnnn'
     * 
     * @param limit 
     * @param value 
     */
    public maskNumbersLongerThanLimit(value: string): string {
        if (!this.settings.masking) {
            return value;
        }
        const regex = new RegExp("[0-9]{" + this.settings.limit + ",}", "g");
        return value.replace(regex, function(match) {
            return Array(match.length + 1).join('n');
        });
    }

    /**
     * Simple selector match control against selectors
     * provided in the settings.
     * 
     * @param element 
     */
    public isElementNotSuitable(element: HTMLElement): boolean {
        const matches = this.settings.excludedSelectors.forEach(a => {
            if (element.matches(a)) {
                return true;
            }
        });
        return Boolean(matches);
    }
}