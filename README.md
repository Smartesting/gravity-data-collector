![Node workflow](https://github.com/Smartesting/gravity-data-collector/actions/workflows/node.js.yml/badge.svg)

# Gravity Data Collector - README

This repo contains the browser implementation of the Gravity Data Collector.
Learn more about Gravity [on our website](https://gravity-testing.com)

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
    "@smartesting/gravity-data-collector": "^3.2.0"
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
  src="https://unpkg.com/@smartesting/gravity-data-collector@3.2.0/dist/gravity-logger-min.js"
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

| key              | type     | use                                                                                                 | default value                                  |
| ---------------- | -------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| authKey          | String   | The authentication key provided by Gravity to select the correct collection                         |                                                |
| requestInterval  | Integer  | Time (in ms) between two sends to Gravity server (buffering)                                        | 5000                                           |
| gravityServerUrl | String   | Gravity server URL                                                                                  | https://smartestinggravityserver.herokuapp.com |
| debug            | Boolean  | Logs user action in the console instead of sending them to Gravity                                  | false                                          |
| maxDelay         | Integer  | In debug mode, adds a random delay (in ms) between 0 and this value before printing an user action. | 500                                            |
| excludeRegex     | RegExp   | Regular expression of ID and class names to ignore in selector computation.                         | none                                           |
| customSelector   | String   | The attribute to use as a selector if defined on an HTML element targeted by a user action.         | none                                           |
| onPublish        | function | Adds a function called after each publish to the gravity server.                                    | none                                           |

## Features

### Work with selectors

In the Gravity Data Collector, when a user action targets an HTML element, a selector is computed in order to 1) obtain
the coverage of a usage in Gravity, and 2) to replay the session as a Cypress test.

The collector use the following priority to compute a unique selector:

1. A specific attribute if a custom selector is specified at the collector initialization (
   e.g., `[my-custom-data=register-button]`)
2. The ID attribute of the element if it's unique on the page (e.g., `#register-button`)
3. The class attribute of the element if it's unique on the page (e.g., `.cls-btn-register`)
4. Full path CSS selector (e.g., `:nth-child(3) > div > button`)

#### Use custom selectors

If an application uses dynamic elements' IDs, it may be necessarily to use custom selectors to identify properly each
element. By using the `customSelector` option:

```typescript
GravityCollector.init({ customSelector: 'data-testid' })
```

If an element defines the `data-testid` attribute, it will be used to compute the selector of the element. For instance,
a click on the following button:

```html
<button id="#button-1" data-testid="register-button">Register</button>
```

Will produces the selector `[data-testid=register-button]`, without the `customSelector` option, the selector would
be `#button-1`

#### Exclude ID or class from selector

By their changeable nature, dynamic HTML IDs can be irrelevant to compute usage coverage or to turn a session into an
executable test. It is possible to exclude an ID or a class pattern from the selector computation. By using
the `excludeRegex` option:

```typescript
GravityCollector.init({ excludeRegex: /^#button-.*$/ })
```

A click on the following button:

```html
<button id="#button-1" class=".button-register">Register</button>
```

Will produces the selector `.button-register` if the class attribute is unique on the page. Note that it's also possible
to exclude class from the selector calculation by using the regex `/^.button-.*$/`

### Identify sessions with _traits_

A sessions trait allows you to add context to the collected sessions, so you can easily segment them in Gravity.
It is done by calling the `identifySession` method.

For instance, you can identify the sessions of users connected to your app:

```typescript
window.GravityCollector.identifySession('connected', true)
```

**Note**: Please, keep in mind that each trait can only have a single value. It means if you set the trait `connected`
to `true` and then to `false`, the first value will be overwritten.

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
with
the page to see collected user actions.

**Note:** user actions may not show up in the console and be hidden by default. Ensure `Verbose` output are allowed by
your
developer tool.
