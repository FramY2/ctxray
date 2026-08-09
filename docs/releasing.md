# Releasing

## One-time repository setup

1. Create the public GitHub repository under the chosen owner.
2. Add that repository URL to `package.json` metadata.
3. Enable GitHub private vulnerability reporting.
4. Protect `main` and require the CI workflow.
5. Publish the first package version manually from the verified tag with 2FA;
   npm requires the package to exist before trusted publishing can be attached.
6. With npm 11.15 or newer, configure future releases:

```shell
npm trust github @framy2/ctxray --file release.yml --repo FramY2/ctxray --environment npm --allow-publish
```

The owner/repository must exactly match `package.json`. The GitHub workflow uses
Node 24, npm 12, OIDC permission, the `npm` environment, and no long-lived npm
token. If the manually bootstrapped version already exists, the workflow
verifies it and skips a duplicate publish.

No GitHub owner is hard-coded in this source tree because repository ownership is
a publisher decision, not a safe build-time assumption.

## Release checklist

```shell
npm ci
npm run check
npm run build
npm run validate:plugin
npm pack --dry-run
```

Then:

1. Confirm `CHANGELOG.md` and the plugin/package versions agree.
2. Commit the release changes.
3. Create and push `vX.Y.Z`.
4. Create the GitHub release. The release workflow publishes new versions to
   npm with automatic OIDC provenance after running the full quality gate.
5. Install from npm and from the GitHub marketplace source in a clean environment.
