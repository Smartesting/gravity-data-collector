# Contributing

## Code styling

We rely on `Husky` and `Prettier` to meet the code standard. Once you have cloned this repository, run the following
commands:

```shell
npm install
npm run prepare
```

This should take care of installing both tool as a `git` hooks which will ensure `prettier` is ran on all files staged
for commit.

## Publishing a release

### Preparing a release:

1. Increase version number in [package.json](package.json).
2. Increase version number in [config.ts](src/config.ts).
3. Run `npm install` in order to update [package-lock.json](package-lock.json) with the right version number.
4. Update [Changelog](CHANGELOG.md).
   1. Set current version number to `Unreleased` section.
   2. Remove empty entries.
   3. Add link to compare changes with previous release.
5. Update [README](README.md) snippets for `package.json` and tag script with current version number.

### Creating the release:

1. [Draft a new release](https://github.com/Smartesting/gravity-data-collector/releases/new)
   1. Create a new tag by prefixing the version number by the letter `v`. Some good tag names might be `v1.0.0` or
      `v2.3.4`.
   2. Use version number as the release title.
   3. Use changelog as the release description.
2. Publish release.
3. Add Unreleased section to the Changelog.

The GitHub action [Publish Package to npmjs](.github/workflows/npm-publish.yml) will automatically publish release to
npm.

## Semantic Versioning

Based on [Semantic Versioning](https://semver.org/spec/v2.0.0.html), given a version number `MAJOR.MINOR.PATCH`,
increment
the:

- `MAJOR` version when you make incompatible API changes.
- `MINOR` version when you add functionality in a backwards compatible manner.
- `PATCH` version when you make backwards compatible bug fixes.

## Making test releases

We use GitHub pages an as host for temporary/test releases and automatically provide `.tgz` and minified JS for the latest commits on branches `main` and `canary`.

To publish from another branch, edit the script [pages-publish workflow](./.github/workflows/pages-publish.yml) on the `main` branch to take your branch into account by adding it to the branches parameter:

```yaml
steps:
  - name: Create pages
    uses: Smartesting/publish-on-pages@main
    with:
      branches: main canary your-branch
```

Then run the workflow `Deploy static content to Pages` on the [workflow page](https://github.com/Smartesting/gravity-data-collector/actions/workflows/pages-publish.yml) (chose `main` as the source branch when running the workflow).

You can now use your draft release. In your `package.json` file:

```json
  "dependencies": {
    "@smartesting/gravity-data-collector": "https://smartesting.github.io/gravity-data-collector/your-branch/smartesting-gravity-data-collector.tgz",
  }
```

Or directly as an HTML script tag:

```html
<script
  async
  id="logger"
  src="https://smartesting.github.io/gravity-data-collector/your-branch/gravity-logger-min.js"
  type="text/javascript"
></script>
```

**Note:** any tag named `vX.Y.Z-beta` will be published on Github pages.

**Warning:** do not remove the `main` and `canary` branches from the script and workflow trigger.
