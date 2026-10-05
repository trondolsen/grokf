# Tests for OKF Graph Explorer

The tests use the unchanged `okf-graph-explorer.html` at the repository root. The Node tests
run with `tools/node-cli/run.sh`; the browser tests and screenshots use
`tools/playwright-cli/run.sh` with Playwright 1.63.0 and Chromium.

## Directory structure

```text
test/
├── README.md
├── package.json
├── playwright.config.cjs
├── unit/
│   ├── security.test.cjs
│   └── serve.test.mjs
├── e2e/
│   └── explorer.spec.cjs
├── support/
│   ├── paths.cjs
│   └── serve.mjs
├── scripts/
│   └── screenshot.mjs
└── fixtures/
    └── basic/
        ├── index.md
        ├── guide.md
        └── nested/reference.md
```

- `unit/`: tests that use only built-in Node.js modules.
- `e2e/`: browser tests; only this directory is discovered by Playwright.
- `support/`: the local HTTP server and shared file paths, URLs and the result folder.
- `scripts/`: tools for manual testing and screenshots.
- `fixtures/`: version-controlled test data, never generated results.

## Setup

Podman must be installed and have a configured machine on macOS. The start
scripts handle starting the machine. Node.js, npm and Playwright do not need to
be installed on the host.

The Playwright image contains the browsers, but not the npm packages. On the
first run the Playwright start script installs `@playwright/test`, `playwright`
and `playwright-core` into the Podman volume `playwright-cli-deps-1.63.0`. Later
runs check the versions and reuse the volume. The first run needs access to the
npm registry and possibly the container registry.

The dependencies are mounted read-only as `node_modules/` in the working
directory inside the container. On the host, only an empty mount directory is
created. Existing packages in the working directory's `node_modules/` are hidden
in the container but are not changed on the host. The start script does not
install the project's other npm packages. Keep the version in the tests'
`package.json` equal to `PLAYWRIGHT_VERSION` in the start script.

The browser and the HTTP server run together on `127.0.0.1:8080` in the
container. The test run itself keeps `--network none`. The project and the
dependencies are read-only; only the result folder is mounted writable.

## Run the tests

Run the commands from the repository root. `--workdir .` makes the whole
repository available to the tests and the local HTTP server.

### Node tests

The security and server tests do not require an npm install:

```sh
bash tools/node-cli/run.sh --workdir . -- \
  --test test/unit/security.test.cjs \
  test/unit/serve.test.mjs
```

For shorter output, `--test-reporter=spec` can be added after `--test`, before
the file paths.

### Browser tests

```sh
bash tools/playwright-cli/run.sh --workdir . -- \
  node_modules/@playwright/test/cli.js \
  test --config test/playwright.config.cjs
```

Playwright starts and stops the HTTP server. Add `--grep 'depth=0'` after the
config path to run only the test for incremental loading.

### Screenshot

```sh
bash tools/playwright-cli/run.sh --workdir . -- \
  test/scripts/screenshot.mjs
```

The screenshot script starts its own server and opens the test bundle when no
URL is given.

The screenshot script supports `[URL] [outfile]`. With an explicit URL, no
server is started automatically; the URL must be reachable from the container.
External sites are not reachable with `--network none`. An explicit outfile must
be inside the container's writable `/artifacts/` tree.

Run the browser tests and the screenshot script sequentially: both use port 8080
and cannot run at the same time in the same container. Separate Podman runs each
have their own loopback server.

## Results

Generated results are outside the test code and the test bundle:

```text
tmp/test/okf-graph-explorer/
├── report/index.html
├── test-results/
└── screenshots/screenshot.png
```

The Playwright start script mounts `tmp/test/` as `/artifacts` and sets
`PLAYWRIGHT_OUTPUT_DIR=/artifacts`. `support/paths.cjs` appends
`okf-graph-explorer/` for this test suite. Local runs use the same
repository-relative result folder. `tmp/` is already excluded from Git.

Older results in `playwright-output/` have not been moved or deleted; new runs
write only to `tmp/test/`.

## Scope and stability

`fixtures/basic/` is a small OKF v0.2 test bundle with three Markdown files and
three directed links. The root index points to the guide; the guide and the
reference point to each other. The test content has no external sources or
claimed verification.

The Node tests check the security functions from the actual HTML file, the
server's GET/HEAD responses and content types, missing files, directory
traversal, and symlinks outside the server root. The server tests use temporary
directories and short-lived servers on random loopback ports.

The browser tests cover loading, file and link counts, search, filters, labels,
tag nodes, Markdown preview, history, directory navigation, incremental loading
with `depth=0`, missing bundles, rejection of bundles from other origins, and
mobile view at 390 × 844. The project's actual knowledge index is tested as a
separate smoke test.

The tests wait for the loading overlay to disappear and the loading spinner to
be hidden. JavaScript errors and the application's console errors make the test
fail. The browser's general resource errors are filtered out because the
missing-bundle test expects 404 responses.

The graph uses a continuous force simulation on canvas. The browser tests
observe actual drawing positions and control the animation frames with
Playwright's clock before clicking; the production code has no test interface.
Screenshots are diagnostic aids, not pixel-exact baselines. `animations:
'disabled'` does not freeze the JavaScript simulation.

The HTTP server serves the repository's content without directory listings and
rejects paths and symlinks outside the root. It is only a local test tool and
must not be exposed as a production server.

## Optional run without Podman

With Node.js 22 or newer on the host:

```sh
npm install --prefix test
npm --prefix test run test:unit
```

For browser tests, Chromium must also be installed separately. Then run
`npm --prefix test test` or `npm --prefix test run screenshot`. The container's
browsers and npm packages are not available on the host.
