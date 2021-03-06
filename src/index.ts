import { ITrackerMap } from './interfaces/ITrackerMap';
import { MouseInteraction } from './classes/interactions/MouseInteraction';
import { Configuration } from './classes/Configuration';
import { IConfiguration } from './interfaces/IConfiguration';
import { Messenger } from './helpers/Messenger';
import { IOptions } from './interfaces/IOptions';
import { IDebounceEvent } from './interfaces/IDebounceEvent';
import { debounce } from './helpers/Utilities';
import { ScrollInteraction } from './classes/interactions/ScrollInteraction';
import { IBaseInteraction } from './interfaces/IBaseInteraction';
import { ITarget } from './interfaces/ITarget';
import { PrivacyManager } from './helpers/PrivacyManager';
import { ITracker } from './interfaces/ITracker';
import './polyfills/polyfills.all.js';

class Kollektor {
    private static instance: Kollektor;
    private messenger: Messenger;
    private privacyManager: PrivacyManager;
    private options: IConfiguration;
    private trackedScrollDistances: number[];
    
    private constructor(options: IConfiguration) {
        this.options = options;
        this.messenger = Messenger.getInstance(this.options.isDebug);
        this.privacyManager = new PrivacyManager(options.privacy);
        this.trackedScrollDistances = [];
    }

    /**
     * Returns Kollektor instance. Creates it if necessary.
     * 
     * @param options 
     */
    public static getInstance(options?: IOptions): Kollektor | void {
        if (!options && !Kollektor.instance || !options) {
            console.error("Kollektor was not provided options and no instance is previously registered.");
            return;
        }
        if (!options && Kollektor.instance) {
            return Kollektor.instance;
        }

        if (options && options.template === "custom" 
            && !options.consumers) {
                    console.error("Kollektor cannot be registered without any callbacks or plugins");
                    return;
        }
        
        const conf: IConfiguration = new Configuration(options);

        if(!Kollektor.instance) {
            Kollektor.instance = new Kollektor(conf);
        }
        return Kollektor.instance;
    }

    /**
     * Creates selector strings for each event and initiates listeners registration.
     */
    private registerListeners(): void {
        this.messenger.log("registerListeners()");
        const events: Map<string,string> = new Map();
        this.options.targets.forEach(target => {
            if (typeof target.events === "string") {
                const event = target.events;
                if (!events.has(event)) {
                    events.set(event, target.selector);
                } else {
                    events.set(event, `${events.get(event)}, ${target.selector}`);
                }
            } else {
                target.events.forEach(event => {
                    if (!events.has(event)) {
                        events.set(event, target.selector);
                    } else {
                        events.set(event, `${events.get(event)}, ${target.selector}`);
                    }
                });
            }
        });
        events.forEach((selectors: string, eventName: string) => {
            this.registerInteractionListener(eventName, selectors);
        });

        // register scroll listeners
        if (this.options.scrollDistances.length != 0) {
            this.registerScrollDistanceListener();
        }
    }

    /**
     * Registers specific listeners according to defined targets and their assigned events.
     * 
     * @param eventName listener event
     * @param selectors listener selectors
     * @returns eventlistener
     */
    private registerInteractionListener(eventName: string, selectors: string): void {
        this.messenger.log("registerInteractionListeners()");
        const that = this;
        const debounceEvent: IDebounceEvent | null = Array.isArray(this.options.debounce) 
            ? this.options.debounce.find(d => d.event == eventName) 
            : this.options.debounce;

        //TODO: Remove code duplication
        if (debounceEvent && (debounceEvent.event == eventName || debounceEvent.event == "all")) {
            document.addEventListener(eventName, debounce(function(this: HTMLElement, e: Event) {
                let element: HTMLElement | null = e.target as HTMLElement;
                for (element; element && element != this; element = element.parentNode as HTMLElement) {
                    if (element.matches(selectors)) {
                        that.analyseInteractionEvent(element, e);
                        break;
                    }
                }
            }, debounceEvent.delay), false);
        } else {
            document.addEventListener(eventName, function(this: HTMLElement, e: Event) {
                let element: HTMLElement | null = e.target as HTMLElement;
                for (element; element && element != this; element = element.parentNode as HTMLElement) {
                    if (element.matches(selectors)) {
                        that.analyseInteractionEvent(element, e);
                        break;
                    }
                }
            }, false);
        }
    }

    /**
     * Registers scroll listener
     */
    private registerScrollDistanceListener(): void {
        const debounceEvent: IDebounceEvent | null = Array.isArray(this.options.debounce) 
            ? this.options.debounce.find(d => d.event == "scroll")
            : (this.options.debounce && (this.options.debounce.event == "all" || this.options.debounce.event == "scroll") 
            ? this.options.debounce : null);
        const that = this;
        if (debounceEvent) {
            document.addEventListener("scroll", debounce(function(e: Event) {
                that.analyseScrollEvent(e);
            }, debounceEvent.delay), false);
        } else {
            document.addEventListener("scroll", function(e: Event) {
                that.analyseScrollEvent(e);
            }, false);
        }
    }

    /**
     * Checks if element matches any of the targets defined in options.
     * If it does, continues with tracker object creation.
     * 
     * Includes minimal privacy check if the element is suitable for collection.
     * 
     * @param element 
     * @param event 
     */
    private analyseInteractionEvent(element: HTMLElement, event: Event): void {
        this.messenger.log("analyseEvent()");
        // Element matches excluded selectors
        if (this.privacyManager.isElementNotSuitable(element)) {
            return;
        }

        // Find target component for clicked element
        const targetComponent: ITarget = this.options.targets.find(target => {
            if (element.matches(target.selector)) return target;
        }) || null;
        
        // In case no matching target component was found, do not proceed.
        if (!targetComponent) return;

        // Create tracker object
        const res: MouseInteraction = new MouseInteraction(element, event as MouseEvent, targetComponent, this.options.containers);
       
        // Trigger registered callbacks
        if (res) {
            this.forwardToConsumers(res);
        }
    }
    
    /**
     * Checks if scroll event has reached any of the distances defined in options.
     * 
     * @param event 
     */
    private analyseScrollEvent(event: Event): void {
        // https://stackoverflow.com/a/59396510 by Dave
        const {target} = event;
        const {documentElement, body} = target as Document;
        const {scrollTop: documentElementScrollTop, scrollHeight: documentElementScrollHeight, clientHeight} = documentElement;
        const {scrollTop: bodyScrollTop, scrollHeight: bodyScrollHeight} = body;
        const percentage = (documentElementScrollTop || bodyScrollTop) / ((documentElementScrollHeight || bodyScrollHeight) - clientHeight) * 100;
        // snippet end

        const passedScrollDistances: number[] = this.options.scrollDistances.filter(sd => sd < percentage);

        // overview in case of debug
        this.messenger.log({
            "optionDistances": this.options.scrollDistances,
            "scrollPercentage": percentage,
            "passedDistances": passedScrollDistances,
            "trackedDistances": this.trackedScrollDistances
        });

        if (!passedScrollDistances.length) return;

        passedScrollDistances.forEach(d => {
            if (!this.trackedScrollDistances.includes(d)) {
                this.forwardToConsumers(new ScrollInteraction(d, event))
                this.trackedScrollDistances.push(d)
            }
        });
    }

    /**
     * Triggers all custom callbacks defined in options.
     * 
     * @param tracker tracker object with collected info.
     */
    private forwardToConsumers(tracker: IBaseInteraction): void {
        this.messenger.log("forwardToConsumers()");
        this.options.consumers.forEach(cb => {
            if ((typeof cb.events === "string" && (cb.events === tracker.eventType || cb.events === "all")) 
            || cb.events.includes(tracker.eventType)) {
                const data: object = this.mapToCallbackObject(tracker, cb.map);
                this.messenger.log({
                    "consumer": cb.name,
                    "providedData": data,
                    "interactionData": tracker
                }); // debug
                cb.handler(tracker.eventType, data);
            }
        });
    }

    /**
     * Maps tracker values to consumer defined object.
     * 
     * @param tracker tracker object with collected info.
     * @param cbObject custom callback map object.
     */
    private mapToCallbackObject(tracker: IBaseInteraction, cbObject: ITrackerMap): object {
        this.messenger.log("mapToCallbackObject()");
        const data: {[key: string]: any} = {};
        Object.entries(cbObject).forEach( ([k, v]) => {
            const val = v.split('.').reduce((a: object, b: keyof object) => a[b], tracker) || "";
            data[k] = typeof(val) == "string" ? this.privacyManager.maskNumbersLongerThanLimit(val) : val;
        });
        return data;
    }

    /**
     * Calls all methods that are necessary for data collecting.
     */
    track(): void {
        this.messenger.log("Tracking started");
        this.registerListeners();
    }
}

/**
 * Library initialization method.
 * Returns a Kollektor instance.
 * 
 * @param options all user defined options.
 */
export const register = (options: IOptions): Kollektor | void => {
    if (!options.consumers) {
        console.warn("Kollektor: cannot be registered without any callbacks or plugins");
        return;
    }
    const improperConsumers: ITracker[] = options.consumers.filter(c => !c.name || !c.map || !c.events || !c.handler);
    if (improperConsumers.length != 0) {
        console.warn(
            "Kollektor: all consumers must have a name, map, events and handler defined", {
            "badConsumers": improperConsumers
        });
        return;
    }
    if (options.scrollDistances) {
        if (options.scrollDistances.filter(d => d > 100 || d < 0).length) {
            console.warn("Scroll distances can be only between 0 and 100");
            return;
        }
    }
    return Kollektor.getInstance(options);
}

export default register;