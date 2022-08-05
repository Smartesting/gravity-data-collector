# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/Smartesting/gravity-data-collector/compare/v1.0.21...main)

### Info

### Added

### Changed

### Deprecated

### Removed

### Fixed

## [1.0.21](https://github.com/Smartesting/gravity-data-collector/compare/v1.0.20...v1.0.21)

### Fixed

- strip trailing slash in `gravityServerUrl` (see [#6](https://github.com/Smartesting/gravity-data-collector/issues/6))

### Security

## [1.0.20](https://github.com/Smartesting/gravity-data-collector/compare/old...new)

### Info

- Previous releases were broken.

### Added

- Track user events: `sessionStarted`, `click`, `change` and `sessionEnded` (which corresponds to the `unload` DOM event)
- Add debug options: when set to `true`, logs events in the console instead of sending to Gravity
