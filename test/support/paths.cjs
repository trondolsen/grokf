const path = require('node:path');

const suiteRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(suiteRoot, '..');
const fixtureUrl = '/test/fixtures';
const artifactsRoot = path.join(
  path.resolve(process.env.PLAYWRIGHT_OUTPUT_DIR ?? path.join(repositoryRoot, 'tmp/test')),
  'okf-graph-explorer'
);

module.exports = {
  suiteRoot,
  repositoryRoot,
  explorerPath: path.join(repositoryRoot, 'okf-graph-explorer.html'),
  explorerUrl: '/okf-graph-explorer.html',
  fixtureUrl,
  basicBundleUrl: `${fixtureUrl}/basic/`,
  baseURL: 'http://127.0.0.1:8080',
  artifactsRoot,
};
