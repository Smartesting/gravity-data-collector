# README #

This repo contains the browser implementation of the Gravity Data Extractor

## How to use

Install the logger and initialize it

```
  // package.json
  "dependencies": {
      ...
      "gravity-data-collector": "git+https://github.com/Smartesting/gravity-data-collector.git"
    }

  // initialize
  import GravityLogger from 'gravity-data-collector'
  GravityLogger.init(/* API KEY*/)
```

## Options

The ```GravityLogger.init()``` can take an ```options``` object

| key     | use                                                                              | default value           |   |   |
|---------|----------------------------------------------------------------------------------|-------------------------|---|---|
| baseUrl | The URL of the Gravity server you want to send the usage traces to               | "https://gravity.smartesting.com" |   |   |
| debug   | Prints the usage data in the browser console instead of posting them to a server | false                   |   |   |
| authorizeBatch | Queues up to 10 logs before sending them to Gravity                              | false ||
| logRequests | Logs Ajax requests and their responses                                           | false ||||



## Sandbox

In order to test modifications on the library, a sandbox is accessible in index.html file

First, build the lib

```
  npm run build
```

Then build the sandbox and watch for files changes:

```
npm run build-sandbox
npm run watch-sandbox
```
