# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0](https://github.com/Smartesting/gravity-data-collector/compare/v4.0.4...v4.1.0)

### Added

- option `useHashInUrlAsPathname` which handles cases where the href of the pages looks like this `http://mysite.com/#/something/else`

## [4.0.4](https://github.com/Smartesting/gravity-data-collector/compare/v4.0.3...v4.0.4)

### Added

- add optional `interactiveTarget` field in `TargetedUserAction` to save ancestor element holding click listener

## [4.0.3](https://github.com/Smartesting/gravity-data-collector/compare/v4.0.2...v4.0.3)

### Removed

`mouseenter` and `mouseleave` events capture, which could be the cause of slowdowns

## [4.0.2](https://github.com/Smartesting/gravity-data-collector/compare/v4.0.1...v4.0.2)

### Removed

- `wheel` event capture, which could be the cause of slowdowns

## [4.0.1](https://github.com/Smartesting/gravity-data-collector/compare/v4.0.0...v4.0.1)

### Fixed

- catch exception `Uncaught ReferenceError: process is not defined` in method `discoverBuildId`

## [4.0.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.17.1...v4.0.0)

### Added

- Add options `anonymizeSelectors` & `ignoreSelectors` to precisely control recording of some elements

### Changed

- Some events are not replicated anymore when they are triggered multiple times with the same target to avoid spamming:
  - `scroll`
  - `wheel`
  - `touchmove`
  - `resize`

### Removed

- remove the following deprecated options:
  - `excludeRegex`: use `selectorsOptions` instead
  - `customSelector`: use `selectorsOptions` instead
  - `originsToRecord`: use `recordRequestsFor` instead

### Fixed

- fix exception `Uncaught ReferenceError: process is not defined` in method `discoverBuildId`

## [3.17.1](https://github.com/Smartesting/gravity-data-collector/compare/v3.17.0...v3.17.1)

### Fixed

- The session timeout was reset with each new tab, causing sessions to last several days
- The session timeout was not reset after new user events

## [3.17.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.16.0...v3.17.0)

### Changed

- Update `UserActionData` to embed data about the targeted element.

## [3.16.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.15.0...v3.16.0)

### Added

- Anonymization of video recordings controllable from Gravity
- Option to enable/disable video recording anonymization in debug mode
- Track new HTML events:
  - `contextmenu`
  - `dblclick`
  - `copy`
  - `cut`
  - `paste`
  - `select`
  - `dragstart`
  - `drop`
  - `play`
  - `pause`
  - `seeked`
  - `fullscreenchange`
  - `resize`
  - `hashchange`
  - `focus`
  - `blur`
  - `submit`
  - `reset`
  - `mouseenter`
  - `mouseleave`
  - `scroll`
  - `wheel`
  - `toggle`
  - `touchstart`
  - `touchmove`
  - `touchend`
  - `touchcancel`

### Changed

- `data-testid` attribute is now collected by default on targeted user actions

## [3.15](https://github.com/Smartesting/gravity-data-collector/compare/v3.14.0...v3.15.0)

### Added

- add collector option `enableEventRecording` to (de)activate event recording
- add collector option `enableVideoRecording` to (de)activate video recording

### Deprecated

- Option `disableVideoRecording` replaced by `enableVideoRecording` (reversed)

### Fixed

- Fix video records loss after session timeout

## [3.14.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.13.0...v3.14.0)

### Added

- Option to disable video recording of sessions

### Changed

- Request interval option default value is reduced to 1000 (instead of 5000)

### Fixed

- Last events of video recording were not sent to Gravity

## [3.13.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.12.0...v3.13.0)

### Changed

- Stream screen recordings

## [3.12.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.11.0...v3.12.0)

### Added

- Add screen recording with `rrweb`

### Changed

- Centralize API endpoints in the `HttpGravityClient.ts` file

## [3.11.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.10.0...v3.11.0)

### Added

- Add option `buildId` to ease specifying the buildId instead of relying on global variables.

## [3.10.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.9.0...v3.10.0)

### Added

- Add request errors `project_not_found` and `project_expired` to prepare the concept renaming `domain` into `project`

## [3.9.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.8.7...v3.9.0)

### Added

- Allow specifying window when initializing
  collector [#24](https://github.com/Smartesting/gravity-data-collector/pull/24)

### Fixed

- Gravity Data Collector import from an HTML tag [#23](https://github.com/Smartesting/gravity-data-collector/pull/23)

## [3.8.7](https://github.com/Smartesting/gravity-data-collector/compare/v3.8.6...v3.8.7)

### Changed

- Use new API endpoint for Gravity (https://api.gravity.smartesting.com)

## [3.8.6](https://github.com/Smartesting/gravity-data-collector/compare/v3.8.5...v3.8.6)

### Changed

- fetch methods now automatically follow redirects

## [3.8.5](https://github.com/Smartesting/gravity-data-collector/compare/v3.8.4...v3.8.5)

### Changed

- Cypress event tracking: reduce `command.args` property if too large

## [3.8.4](https://github.com/Smartesting/gravity-data-collector/compare/v3.8.3...v3.8.4)

### Fixed

- force "user actions" flushing on Cypress event "test:after:run"

## [3.8.3](https://github.com/Smartesting/gravity-data-collector/compare/v3.8.2...v3.8.3)

### Fixed

- Cypress event tracking: send all the events to Gravity
- batch user action sending

## [3.8.2](https://github.com/Smartesting/gravity-data-collector/compare/v3.8.1...v3.8.2)

### Fixed

- `CookieSessionIdHandler`: prevent error when `document.location` has not been defined

## [3.8.1](https://github.com/Smartesting/gravity-data-collector/compare/v3.8.0...v3.8.1)

### Changed

- Cypress event tracking: skip some events (named 'then', 'task' or 'wrap')

## [3.8.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.7.1...v3.8.0)

### Added

- track Cypress test information (if available) as a new `TestCommand` user action

## [3.7.1](https://github.com/Smartesting/gravity-data-collector/compare/v3.7.0...v3.7.1)

### Fixed

- Prevent creating a new session for each action if the URL is an IP address

## [3.7.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.6.0...3.7.0)

### Added

- add `testingTool` property to `TestContext` to store used testing tool (e.g. Cypress)

## [3.6.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.5.4...v3.6.0)

### Added

- Store Cypress test context in tracked SessionStartedUserAction

## [3.5.4](https://github.com/Smartesting/gravity-data-collector/compare/v3.5.3...v3.5.4)

### Fixed

- Prevent "Cannot read properties of undefined (reading 'toLowerCase')" runtime error

## [3.5.3](https://github.com/Smartesting/gravity-data-collector/compare/v3.5.2...v3.5.3)

### Fixed

- Trigger a `Change` event when typing in a text field (`<input type="text" />`
  or `<textarea />`) [#20](https://github.com/Smartesting/gravity-data-collector/pull/20)

## [3.5.2](https://github.com/Smartesting/gravity-data-collector/compare/v3.5.1...v3.5.2)

### Fixed

- XHR requests were not recorded

## [3.5.1](https://github.com/Smartesting/gravity-data-collector/compare/v3.5.0...v3.5.1)

### Deprecated

- Option `originsToRecord`, renamed `recordRequestsFor`

## [3.5.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.4.2...v3.5.0)

### Added

- Track multiple selectors for targets
- Option `selectorsOptions` allowing fine tuning of target selectors
- Option `originsToRecord` allowing record of requests
- Fetch button on sample page

### Deprecated

- Field `selector` of `UserActionTarget`.
- Option `excludeRegex` and `customSelector` of `CollectorOptions`

## [3.4.2](https://github.com/Smartesting/gravity-data-collector/compare/v3.4.1...v3.4.2)

### Fixed

- Prevent the error triggered by a drag'n drop event

## [3.4.1](https://github.com/Smartesting/gravity-data-collector/compare/v3.4.0...v3.4.1)

### Fixed

- Fix the search for the label associated with an element

## [3.4.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.3.2...v3.4.0)

### Added

- Send `buildId` in SessionStartedUserAction when `GRAVITY_BUILD_ID` or `REACT_APP_GRAVITY_BUILD_ID` is set.

## [3.3.2](https://github.com/Smartesting/gravity-data-collector/compare/v3.3.1...v3.3.2)

### Changed

- `IdentifySessionError` enumeration

## [3.3.1](https://github.com/Smartesting/gravity-data-collector/compare/v3.3.0...v3.3.1)

### Changed

- `AddSessionUserActionsError` enumeration

## [3.3.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.2.0...v3.3.0)

### Added

- New option `sessionsPercentageKept`: rate (in 0..100) of sessions to be collected _(default is 100)_.
- New option `rejectSession`: boolean function to disable session tracking

## [3.2.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.1.1...v3.2.0)

### Added

- New option `excludeRegex`: regular expression to define ID and class names to ignore in selector computation.
- New option `customSelector`: string indicates the attribute to use as a selector if defined on an HTML element
  targeted by a user action.

## [3.1.1](https://github.com/Smartesting/gravity-data-collector/compare/v3.1.0...v3.1.1)

### Fixed

- Session cookies are now saved at the `root` of the website. This prevents some bugs due to a change of session id
  between two different pathnames

## [3.1.0](https://github.com/Smartesting/gravity-data-collector/compare/v3.0.0...v3.1.0)

### Added

- New storage for session identifiers: `session cookies`. This ensures that the same session is maintained when browsing
  different subdomains of a superdomain
- A session now expires after `30 minutes` without user action

## [3.0.0](https://github.com/Smartesting/gravity-data-collector/compare/v2.2.0...v3.0.0)

### Changed

- Type `Traits` renamed more precisely to `SessionTraits` and moved to `types.ts` file
- Type `TraitValue` renamed more precisely to `SessionTraitValue`
- Method `sendSessionTraits` now returns a response typed `IdentifySessionResponse` with well-typed error
- Method `sendSessionUserActions` now returns a response typed `AddSessionUserActionsResponse` with well-typed error

### Fixed

- Stop tracking when receiving errors specified in [config.ts](./src/config.ts)
- Prevent error in method `isKeyAllowedByKeyListeners`

## [2.2.0](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.11...v2.2.0)

### Added

- `onPublish` callback function called each time events are sent to the gravity server.

### Changed

- Update README.md: describe how to identify session with traits

## [2.1.11](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.10...v2.1.11)

### Added

- Add `GravityCollector.identifySession` method to record custom session data

## [2.1.10](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.9...v2.1.10)

### Changed

- Records all `click` events, even where they are fired by a key or an automated test framework

### Fixed

- Sending user actions twice when `maxDelay` is set to `0`

## [2.1.9](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.8...v2.1.9)

### Added

- Collect `Enter` and `NumpadEnter` key down and press while targeting an input

## [2.1.8](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.7...v2.1.8)

### Changed

- Start a new session when the collector is run in a Cypress test context and the current test name is different from
  the previous one.

## [2.1.7](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.6...v2.1.7)

### Changed

- Stop collecting consecutive keydown actions targeting the same element (
  see [#9](https://github.com/Smartesting/gravity-data-collector/issues/9))

### Fixed

- Remove version from the minified script link in README and sample

## [2.1.6](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.5...v2.1.6)

### Fixed

- Restore the local link toward local dist-sandbox/bundle.js in sample

## [2.1.5](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.4...v2.1.5)

### Info

- Minified version are not available for previous releases

### Added

- A minified version is now deploy with npm package and can be accessed using [UNPKG](https://unpkg.com/) service

## [2.1.4](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.3...v2.1.4)

### Fixed

- Do not set `Origin` header when no source is provided. (
  see [#8](https://github.com/Smartesting/gravity-data-collector/issues/8))
- Do not access directly `global.document`, leave it to a function dedicated if `global` is not defined. (
  see [#7](https://github.com/Smartesting/gravity-data-collector/issues/7))

## [2.1.3](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.2...v2.1.3)

### Changed

- Add `source: string` optional parameter to `sendSessionUserActions`

## [2.1.2](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.1...v2.1.2)

### Added

- Export `sendSessionUserActions` in [types.ts](./src/types.ts)

## [2.1.1](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.0...v2.1.1)

### Fixed

- Use `window.sessionStorage` to save and retrieve user session id.
- Use `beforeunload` to collect form submission

## [2.1.0](https://github.com/Smartesting/gravity-data-collector/compare/v2.0.0...v2.1.0)

### Added

- Add display info to target: `label`, `placeholder` and `text`.
- Add a `select` element to sample.

### Changed

- Emit `ES5` Javascript code instead of `es2021`

## [2.0.0](https://github.com/Smartesting/gravity-data-collector/compare/v1.0.21...v2.0.0)

### Added

- Add `keyup` event listener (see [#2](https://github.com/Smartesting/gravity-data-collector/issues/2))
- Add `keydown` event listener (see [#2](https://github.com/Smartesting/gravity-data-collector/issues/2))

### Changed

- Stop recording `click` while it is fired by keyboard (
  see [#2](https://github.com/Smartesting/gravity-data-collector/issues/2))
- Objects sent to Gravity Server are now called `SessionUserAction` instead of `SessionEvent`

### Removed

- Stop recording `unload`
- Stop recording the whole `attributes` object from html elements

### Fixed

- Simplify sample

## [1.0.21](https://github.com/Smartesting/gravity-data-collector/compare/v1.0.20...v1.0.21)

### Fixed

- Strip trailing slash in `gravityServerUrl` (see [#6](https://github.com/Smartesting/gravity-data-collector/issues/6))

### Security

## [1.0.20](https://github.com/Smartesting/gravity-data-collector/compare/old...new)

### Info

- Previous releases were broken.

### Added

- Track user events: `sessionStarted`, `click`, `change` and `sessionEnded` (which corresponds to the `unload` DOM
  event)
- Add debug options: when set to `true`, logs events in the console instead of sending to Gravity
