# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.10...main)

### Info

### Added

- Add `GravityCollector.identifySession` method to record custom session data

### Changed

### Deprecated

### Removed

### Fixed

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
