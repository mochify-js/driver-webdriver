/*
 * To run this test locally:
 *
 * selenium-server standalone --port 4444
 */
'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const { mochify } = require('@mochify/mochify');

describe('webdriver', () => {
  it('runs test with plugin', async () => {
    sinon.replace(process.stdout, 'write', sinon.fake());

    await mochify({
      driver: `${__dirname}/../index.js`,
      reporter: 'json',
      spec: `${__dirname}/fixture/passes.js`
    });
    // First call to stdout write:
    // 2023-12-24T15:45:27.855Z INFO @wdio/utils: Connecting to existing driver …
    // @ts-ignore
    const output = process.stdout.write.secondCall.args[0];
    sinon.restore(); // Restore sandbox here or test output breaks

    const json = JSON.parse(output);
    assert.equals(json.tests.length, 1);
    assert.equals(json.tests[0].fullTitle, 'test passes');
  });
});
