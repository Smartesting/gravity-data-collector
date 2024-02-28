![Node workflow](https://github.com/Smartesting/gravity-data-collector/actions/workflows/node.js.yml/badge.svg)

# Gravity Data Collector - README

This repo contains the browser implementation of the Gravity Data Collector. Learn more about
Gravity [on our website](https://gravity-testing.com)

## Setup

### Via NPM

```console
npm i @smartesting/gravity-data-collector
```

### Via Yarn

```console
yarn add @smartesting/gravity-data-collector
```

### By updating package.json

In your `package.json`, add the following:

```json
{
  "dependencies": {
    "@smartesting/gravity-data-collector": "^4.1.0"
  }
}
```

In your `package.json`, add the following:

### From a script tag

Put this tag in each page that must use Gravity Data Collector.

```html
<script
  async
  id="logger"
  type="text/javascript"
  src="https://unpkg.com/@smartesting/gravity-data-collector@4.1.0/dist/gravity-logger-min.js"
></script>
```

Please, look to [index.html](samples/index.html) to see how to use the script in HTML.

**Note:** The minified version of Gravity Data Collector is available only since release 2.1.5

## Initialization

```typescript
// initialize
import GravityCollector from '@smartesting/gravity-data-collector/dist'

GravityCollector.init(/*options*/)
```

## Options

The `GravityCollector.init()` can take a `CollectorOptions` object with the following optional properties:

| key                      | type                     | use                                                                                                                                                                                             | default value                       |
| ------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| authKey                  | String                   | The authentication key provided by Gravity to select the correct collection                                                                                                                     |                                     |
| requestInterval          | Integer                  | Time (in ms) between two sends to Gravity server (buffering)                                                                                                                                    | 1000                                |
| gravityServerUrl         | String                   | Gravity server URL                                                                                                                                                                              | https://api.gravity.smartesting.com |
| debug                    | Boolean                  | Logs user action in the console instead of sending them to Gravity                                                                                                                              | false                               |
| maxDelay                 | Integer                  | In debug mode, adds a random delay (in ms) between 0 and this value before printing an user action.                                                                                             | 500                                 |
| selectorsOptions         | Object (optional)        | See [Work with selectors](#work-with-selectors).                                                                                                                                                | undefined                           |
| sessionsPercentageKept   | [0..100]                 | Rate of sessions to be collected                                                                                                                                                                | 100                                 |
| rejectSession            | function `() => boolean` | Boolean function to ignore session tracking. For instance, to ignore sessions from some bots:<br /><code>rejectSession: () => /bot&#124;googlebot&#124;robot/i.test(navigator.userAgent)</code> | `() => false`                       |
| onPublish                | function (optional)      | Adds a function called after each publish to the gravity server.                                                                                                                                | undefined                           |
| recordRequestsFor        | String[] (optional)      | The Gravity Data Collector does not record requests by default. You must specify here the URL origin(s) of the requests to record. For example: "https://myserver.com/"                         | undefined                           |
| buildId                  | String (optional)        | The build reference when running tests                                                                                                                                                          | undefined                           |
| enableEventRecording     | Boolean (optional)       | Set to `false` to deactivate any recording (event & video) (only in debug mode, otherwise this option is controlled from the Gravity interface)                                                 | true                                |
| enableVideoRecording     | Boolean (optional)       | Set to `false` to deactivate video recording (only in debug mode, otherwise this option is controlled from the Gravity interface)                                                               | true                                |
| enableVideoAnonymization | Boolean (optional)       | Set to `false` to deactivate video anonymization (only in debug mode, otherwise this option is controlled from the Gravity interface)                                                           | true                                |
| anonymizeSelectors       | string (optional)        | HTML elements (and descendants) matching this CSS selector will be anonymized (only in debug mode, otherwise this option is controlled from the Gravity interface)                              | undefined                           |
| ignoreSelectors          | string (optional)        | HTML elements (and descendants) matching this CSS selector will not be recorded (only in debug mode, otherwise this option is controlled from the Gravity interface)                            | undefined                           |
| useHashInUrlAsPathname   | Boolean (optional)       | Set to `true` to have a correct representation of pages in Gravity if your page URLs look like this: "http://mysite.com/#/something/else"                                                       | false                               |

## Features

### Work with selectors

In the Gravity Data Collector, when a user action targets an HTML element, selectors are computed in order to replay the
session as an automated test.

By default, the following selectors are computed:

- `xpath`: a XPath selector to reach the element (eg: `/html/body/div`)
- `queries`: on object describing various ways to reach the objet
  - `id`: if available, the element's id (eg: `#my-object`)
  - `class`: if available, selection of the object following CSS classes (eg: `.my-container .some-class`)
  - `tag`: selection based on the tags (eg: `html body div ul li`)
  - `nthChild`: selection based on nth-child (eg: `:nth-child(2) > :nth-child(4)`)
  - `attributes`: if available, selection based on the nodes attributes (eg: `[name=]`)
  - `combined`: a combination of the previous selectors (eg: `#menu nav :nth-child(2)`)
- `attributes`: a hash of attributes provided by the user (default: `['data-testid']`)

#### Tweaking selectors

`xpath` is always collected.

When initializing the collector, you can specify which selectors (in the `queries` field) and `attributes` you want to
collect.

```typescript
GravityCollector.init({ selectorsOptions: { attributes: ['data-testid', 'role'] } })
```

This configuration will collect all the selectors (default if `queries` is not specified), the `data-testid` and
the `role` attributes of the HTML element with which the user
interacts.

```typescript
GravityCollector.init({ selectorsOptions: { queries: ['class', 'tag'] } })
```

This configuration will collect the CSS `class`(es), the `tag` and the `data-testid` (default if `attributes` is not
specified) of the HTML element with which the user
interacts.

Alternatively, you can also exclude some
selectors of the `queries` field. For example, if you do not want id-based selectors, you can specify it this way:

```typescript
GravityCollector.init({
  selectorsOptions: {
    excludedQueries: ['id'],
  },
})
```

You can specify both `queries` and `attributes` fields:

```typescript
GravityCollector.init({
  selectorsOptions: {
    queries: ['class', 'tag'],
    attributes: ['data-testid', 'role'],
  },
})
```

### Identify sessions with _traits_

A sessions trait allows you to add context to the collected sessions, so you can easily segment them in Gravity. It is
done by calling the `identifySession` method.

For instance, you can identify the sessions of users connected to your app:

```typescript
window.GravityCollector.identifySession('connected', true)
```

**Note**: Please, keep in mind that each trait can only have a single value. It means if you set the trait `connected`
to `true` and then to `false`, the first value will be overwritten.

### Send build information to Gravity

In order to easily identify your tests sessions in Gravity, the data-collector can send build information to Gravity.

The build ID can be specified in multiple way. You can set the following properties on `process.env` (for example when
using React)

| environment variable name  | Gravity data |
| -------------------------- | ------------ |
| GRAVITY_BUILD_ID           | buildId      |
| REACT_APP_GRAVITY_BUILD_ID | buildId      |

You can also declare `window.GRAVITY_BUILD_ID` (or simply declare a global variable `GRAVITY_BUILD_ID` which should be
assigned to the window object).

Another solution is to pass the `buildId`parameter when initializing gravity data collector:

```javascript
GravityCollector.init({
  authKey: '...',
  buildId: '1234',
})
```

## Sandbox

In order to test modifications on the library, a sandbox is accessible in [index.html](samples/index.html) file

First, build the lib

```shell
  npm run build
```

Then build the sandbox and watch for files changes:

```shell
npm run build-sandbox
npm run watch-sandbox
```

Finally, open [index.html](samples/index.html) with a browser, display the console (F12 with most browsers) and interact
with the page to see collected user actions.

**Note:** user actions may not show up in the console and be hidden by default. Ensure `Verbose` output are allowed by
your developer tool.

## Any Question ?

Maybe you need help to install and/or understand Gravity Data Collector

- please visit our [documentation](https://docs.gravity-testing.com/) pages
- we start a [FAQ](FAQ.md) hoping it can help you to face eventual problems with th Gravity Data Collector
- [here](flowchart.md) is a flowchart summarizing how the collector works, depending on the options and configuration of
  your Gravity project.
