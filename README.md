![Node workflow](https://github.com/Smartesting/gravity-data-collector/actions/workflows/node.js.yml/badge.svg)

# README

This repo contains the browser implementation of the Gravity Data Collector

## How to use

### Via NPM

> npm i @smartesting/gravity-data-collector

### By updating package.json

In your `package.json`, add the following:

```json
{
  "dependencies": {
    "@smartesting/gravity-data-collector": "^1.0.0"
  }
}
```

### Initializaton

```typescript
// initialize
import GravityCollector from 'gravity-data-collector'

GravityCollector.init(/*options*/)
```

## Options

The `GravityCollector.init()` can take a `CollectorOptions` object with the following optional properties:

| key              | type    | use                                                                                           | default value                                  |
| ---------------- | ------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| authKey          | String  | The authentication key provided by Gravity to select the correct collection                   |                                                |
| requestInterval  | Integer | Time (in ms) between two sends to Gravity server (buffering)                                  | 5000                                           |
| gravityServerUrl | String  | Gravity server URL                                                                            | https://smartestinggravityserver.herokuapp.com |
| debug            | Boolean | Logs events in the console instead of sending them to Gravity                                 | false                                          |
| maxDelay         | Integer | In debug mode, adds a random delay (in ms) between 0 and this value before printing an event. | 500                                            |

## Sandbox

In order to test modifications on the library, a sandbox is accessible in [index.html](index.html) file

First, build the lib

```shell
  npm run build
```

Then build the sandbox and watch for files changes:

```shell
npm run build-sandbox
npm run watch-sandbox
```

Finally, open [index.html](index.html) with a browser, display the console (F12 with most browsers) and interact with
the page to see collected events.

**Note:** events may not show up in the console and be hidden by default. Ensure `Verbose` output are allowed by your developer tool.
