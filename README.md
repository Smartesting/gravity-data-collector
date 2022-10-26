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
    "@smartesting/gravity-data-collector": "^2.2.0"
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
  src="https://unpkg.com/@smartesting/gravity-data-collector@2.2.0/dist/gravity-logger-min.js"
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
| onPublish        | function | Adds a function called after each publish to the gravity server.                                    | none                                           |

## Features

### Identify sessions with _traits_

A sessions trait allows you to add context to the collected sessions so you can easily segment them in Gravity.
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
