# kollektor-js

Lightweight library that helps to collect UI event data. E.g. click, scroll, change etc. Aims to provide a portable and quick to install setup that would limit the need for tagging, usage of tag manager and data parameters. Works without dependencies.

Meant as an addition to existing implementation, especially for those not excited about using tag manager for click tracking.

## Usage

The module can be installed as a project dependency or used with a script tag. Call `register` with options, then `track` to begin collecting data.

Minimal usage needs at least one consumer.

``` js
import * as _kollektor from 'kollektor-js';

const kollektor = _kollektor.register({
    consumers: [
        {
            name: "Demo consumer",
            map: {
                event_category: 'collectedProperties.action',
                event_label: 'collectedProperties.label',
            },
            handler: (eventName, data) => {
                console.log("Demo consumer callback");
                console.log(data);
            },
            events: "all"
        }
    ]
});

kollektor.track();
```

### Browser usage

Load library on site with a script tag.

```html
<script src="https://unpkg.com/kollektor-js/dist/kollektor.min.js"></script>
```

A `_kollektor` object will available on a global scope.

```html
<script>
var demoKollektor = _kollektor.register({
    consumers: [
        {
            name: "Demo consumer",
            map: {
                event_category: 'collectedProperties.action',
                event_label: 'collectedProperties.label',
            },
            handler: (eventName, data) => {
                console.log("Demo consumer callback");
                console.log(data);
            },
            events: "all"
        },
        {
          name: "Google Analytics",
          map: {
            event_category: 'collectedProperties.action',
            event_label: 'collectedProperties.label'
          },
          handler: (eventName, data) => {
            // In this example site would also have a Google Analytics global site tag (gtag.js)
            gtag('event', eventName, data);
          },
          events: "all"
        }
    ]
});
demoKollektor.track();
</script>
```

## Minimal configuration

At least one consumer needs to be defined for the script to activate. It can be something as simple as a logging callback or Google Analytics. See usage example above.

## Options

### template `string` *(optional)*

default: `'default'`  
other options: `'bootstrap4'`, `'custom'`  

Default template is based on classical selectors and tries to provide structured data without additional configuration. For Bootstrap 4, a separate template can be used.

Custom template allows to define own targets and containers.

### isDebug *(optional)* `boolean`

default: `false`  

Adds some logging.

### privacy `Object` *(optional)*

Allows setup of a few privacy oriented behaviours.

```js
privacy: {
    masking: true, // when 'true', masks all numbers with more than [limit] digits with 'n'. E.g 'sensitive123456' -> 'sensitivennnnnn'
    limit: 5,
    excludedSelectors: [] // css selectors to match
}
```

### debounce `Object | Array` *(optional)*

Allows debouncing all or specific events for certain time.

```js
debounce: [
    {
        event: "resize",
        delay: 500
    },
    {
        event: "scroll",
        delay: 500
    }
]
```

or

```js
debounce: {
    event: "all", // or specifically e.g "click"
    delay: 500
}
```

### targets `Array` *(optional)*

When template is `'custom'` but there are no targets, default targets are used.

#### target `Object`

required: `name`, `selector`, `events`  
optional: `labelAttribute`, `identifierAttribute`, `condition`

  ```js
  {
    name: "link",
    selector: "a",
    events: ["click"]
  }
  ```
  
`labelAttribute`, `identifierAttribute` can be `String` or a `Function` that returns a string.
`condition` expects a function that takes HTMLElement as input and returns boolean.

### containers `Array` *(optional)*

When template is `'custom'` and there are no containers provided, default targets are used.

#### container `Object`

required: `name`, `selector`
optional: `nameAttribute`, `condition`

`nameAttribute` expects a `String`, `condition` a function that takes HTMLElement as input and returns boolean

### consumers `Array`

Consumers provide a map against values provided by kollektor and trigger the correct method of an analytics tool to initiate data sending.  
A consumer contains `name`, `handler`, `map` and `events` properties. A `map` is an object where property values point to available values using dot notation. E.g `collectedProperties.action`.  
Example above demonstrates usage.
Here's an example of possible values made available:

```js
{
    collectedProperties: {
        action: "link-click",                       // [target]-[event.type]
        container: {
            all: "form[register]:main",
            highest: "main",
            lowest: "form[registrationForm]"        // container[containerName], form had id "registrationForm"
        },
        identifier: "test-id-of-link",
        isLink: true,
        isOutbound: false,
        label: "Some link",
        type: "link"                                // target defined type
    },
    nativeProperties: {
        attributes: [],
        classes: [],
        href: "/page",
        id: "test-id-of-link"
        role: "",
        style: "",
        type: ""
    },
    matchedTarget: {
        name: "link",
        selector: "a",
        events: ["click"]
    },
    matchedContainers: [
        {
            name: "form",
            selector: "form"
        },
        {
            name: "main",
            selector: "body"
        }
    ],
    eventType: "click",
    element: HTMLElement
}
```

### scrollDistances `Array` *(optional)*

Values between 1-100.  
Scroll provides only `collectedProperties.action` and `eventType`.
