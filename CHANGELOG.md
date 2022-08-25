# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/Smartesting/gravity-data-collector/compare/v2.1.1...main)

### Info

### Added
- Export `sendSessionUserActions` in [types.ts](./src/types.ts) 
### Changed

### Deprecated

### Removed

### Fixed

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
