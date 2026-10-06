const path = require('node:path');

const suiteRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(suiteRoot, '..');
const fixtureUrl = '/test/fixtures';
const artifactsRoot = path.join(
  path.resolve(process.env.PLAYWRIGHT_OUTPUT_DIR ?? path.join(repositoryRoot, 'tmp/test')),
  'grokf'
);

module.exports = {
  suiteRoot,
  repositoryRoot,
  explorerPath: path.join(repositoryRoot, 'grokf.html'),
  explorerUrl: '/grokf.html',
  fixtureUrl,
  basicBundleUrl: `${fixtureUrl}/basic/`,
  baseURL: 'http://127.0.0.1:8080',
  artifactsRoot,
};
