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
    "@smartesting/gravity-data-collector": "^3.8.3"
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
  src="https://unpkg.com/@smartesting/gravity-data-collector@3.8.3/dist/gravity-logger-min.js"
></script>
```

Please, look to [index.html](sample/index.html) to see how to use the script in HTML.

**Note:** The minified version of Gravity Data Collector is available only since release 2.1.5

## Initialization

```typescript
// initialize
import GravityCollector from '@smartesting/gravity-data-collector/dist'

GravityCollector.init(/*options*/)
```

## Options

The `GravityCollector.init()` can take a `CollectorOptions` object with the following optional properties:

| key                    | type                     | use                                                                                                                                                                                             | default value                                  |
| ---------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| authKey                | String                   | The authentication key provided by Gravity to select the correct collection                                                                                                                     |                                                |
| requestInterval        | Integer                  | Time (in ms) between two sends to Gravity server (buffering)                                                                                                                                    | 5000                                           |
| gravityServerUrl       | String                   | Gravity server URL                                                                                                                                                                              | https://smartestinggravityserver.herokuapp.com |
| debug                  | Boolean                  | Logs user action in the console instead of sending them to Gravity                                                                                                                              | false                                          |
| maxDelay               | Integer                  | In debug mode, adds a random delay (in ms) between 0 and this value before printing an user action.                                                                                             | 500                                            |
| excludeRegex           | RegExp                   | <u>Deprecated</u>, use <code>selectorsOptions</code> instead. <br/>Regular expression of ID and class names to ignore in selector computation.                                                  | null                                           |
| customSelector         | String (optional)        | <u>Deprecated</u>, use <code>selectorsOptions</code> instead. <br/>The attribute to use as a selector if defined on an HTML element targeted by a user action.                                  | undefined                                      |
| selectorsOptions       | Object (optional)        | See [Tweaking selectors](#tweaking-selectors).                                                                                                                                                  | undefined                                      |
| sessionsPercentageKept | [0..100]                 | Rate of sessions to be collected                                                                                                                                                                | 100                                            |
| rejectSession          | function `() => boolean` | Boolean function to ignore session tracking. For instance, to ignore sessions from some bots:<br /><code>rejectSession: () => /bot&#124;googlebot&#124;robot/i.test(navigator.userAgent)</code> | `() => false`                                  |
| onPublish              | function (optional)      | Adds a function called after each publish to the gravity server.                                                                                                                                | undefined                                      |
| originsToRecord        | String[] (optional)      | <u>Deprecated</u>, renamed <code>recordRequestsFor</code>.                                                                                                                                      | undefined                                      |
| recordRequestsFor      | String[] (optional)      | The Gravity Data Collector does not record requests by default. You must specify here the URL origin(s) of the requests to record. For example: "https://myserver.com/"                         | undefined                                      |

## Features

### Work with selectors

In the Gravity Data Collector, when a user action targets an HTML element, selectors computed in order to 1) obtain
the coverage of a usage in Gravity, and 2) to replay the session as a Cypress test.

By default, the following selectors are computed:

- `xpath`: a XPath selector to reach the element (eg: `/html/body/div`)
- `queries`: on object describing various ways to reach the objet
  - `id`: if available, the element's id (eg: `#my-object`)
  - `class`: if available, selection of the object following CSS classes (eg: `.my-container .some-class`)
  - `tag`: selection based on the tags (eg: `html body div ul li`)
  - `nthChild`: selection based on nth-child (eg: `:nth-child(2) > :nth-child(4)`)
  - `attributes`: if available, selection based on the nodes attributes (eg: `[name=]`)
  - `combined`: a combination of the previous selectors (eg: `#menu nav :nth-child(2)`)
- `attributes`: a hash of attributes provided by the user (eg: `{'data-testid': 'my-datatestid', role: 'list'}`)

#### Tweaking selectors

When initializing the collector, you can specify which selectors are activated and custom attributes, for example:

```typescript
GravityCollector.init({ selectorsOptions: { attributes: ['data-testid', 'role'] } })
```

This configuration will collect the `data-testid` and `role` attributes of the HTML elements with which the user interacts.

```typescript
GravityCollector.init({ selectorsOptions: { queries: ['class', 'tag'] } })
```

This configuration will only use CSS classes and tags to compute the selectors. Alternatively, you can also exclude some queries from the selectors. For example, if you do not want id-based selectors, you can specify it this way:

```typescript
GravityCollector.init({
  selectorsOptions: {
    excludedQueries: ['id'],
  },
})
```

You can specify both custom attributes and which selectors are computed:

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

In order to easily identify your tests sessions in Gravity, the data-collector can send build information to Gravity:

| environment variable name  | Gravity data |
| -------------------------- | ------------ |
| GRAVITY_BUILD_ID           | buildId      |
| REACT_APP_GRAVITY_BUILD_ID | buildId      |

Those variables can be easily exposed in `process.env`.

## Sandbox

In order to test modifications on the library, a sandbox is accessible in [index.html](sample/index.html) file

First, build the lib

```shell
  npm run build
```

Then build the sandbox and watch for files changes:

```shell
npm run build-sandbox
npm run watch-sandbox
```

Finally, open [index.html](sample/index.html) with a browser, display the console (F12 with most browsers) and interact
with the page to see collected user actions.

**Note:** user actions may not show up in the console and be hidden by default. Ensure `Verbose` output are allowed by
your developer tool.
