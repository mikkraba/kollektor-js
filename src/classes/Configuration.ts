import { ConfigurationTemplate } from './../types/ConfigurationTemplate';
import { IConfiguration } from '../interfaces/IConfiguration';
import { IPrivacySettings } from '../interfaces/IPrivacySettings';
import { ITracker } from '../interfaces/ITracker';
import { defaultTemplate } from '../templates/default';
import { IOptions } from '../interfaces/IOptions';
import { ConfigurationTemplates } from '../enums/ConfigurationTemplates';
import { IDebounceEvent } from '../interfaces/IDebounceEvent';
import { bootstrap4Template } from '../templates/bootstrap4';
import { ITarget } from '../interfaces/ITarget';
import { IContainer } from '../interfaces/IContainer';

export class Configuration implements IConfiguration {
    template: string;
    isDebug: boolean;
    privacy: IPrivacySettings;
    debounce: IDebounceEvent | IDebounceEvent[];
    targets: ITarget[];
    containers: IContainer[];
    consumers: ITracker[];
    scrollDistances: number[];
    
    constructor(options: IOptions) {
        const o: IConfiguration = options.template === ConfigurationTemplates.CUSTOM 
            ? this.mapCustomOptionsToConfiguration(options) 
            : this.getTemplate(options.template);

        this.template = o.template;
        this.isDebug = options.isDebug || o.isDebug;
        this.privacy = options.privacy || o.privacy;
        this.debounce = options.debounce || o.debounce;
        this.targets = options.targets || o.targets;
        this.containers = options.containers || o.containers;
        this.consumers = options.consumers || [];
        this.scrollDistances = options.scrollDistances || o.scrollDistances;
    }

    /**
     * Creates a configuration object by trying to use user provided input. 
     * Defaults to default template option values when a user has not specified 
     * certain option.
     * 
     * @param options 
     */
    private mapCustomOptionsToConfiguration(options: IOptions): IConfiguration {
        return {
            template: ConfigurationTemplates.CUSTOM,
            isDebug: options.isDebug || defaultTemplate.isDebug,
            privacy: options.privacy || defaultTemplate.privacy,
            debounce: typeof(options.debounce) !== "undefined" ? options.debounce : defaultTemplate.debounce,
            targets: options.targets && options.targets.length != 0 ? options.targets : defaultTemplate.targets,
            containers: options.containers && options.containers.length != 0 ? options.containers : defaultTemplate.containers,
            consumers: options.consumers || defaultTemplate.consumers,
            scrollDistances: options.scrollDistances || defaultTemplate.scrollDistances
        }
    }

    /**
     * Returns a pre-defined template.
     * 
     * @param template name of template.
     */
     public getTemplate(template?: ConfigurationTemplate): IConfiguration {
        switch(template) {
            case ConfigurationTemplates.BOOTSTRAP4:
                return bootstrap4Template;
            default:
                return defaultTemplate;
        }
    }
}