/*
 * To run this test locally:
 *
 * selenium-server standalone --port 4444
 */
'use strict';

const http = require('http');
const { assert, sinon } = require('@sinonjs/referee-sinon');
const { mochify } = require('@mochify/mochify');

describe('webdriver', () => {
  before(async function () {
    const selenium_running = await pingSelenium();
    if (!process.env.CI && !selenium_running) {
      this.skip();
    }
  });

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

function pingSelenium() {
  return new Promise((resolve, reject) => {
    http
      .get('http://localhost:4444/wd/hub/status', (res) => {
        res.on('data', () => {}); // consume request body
        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Received unexpected ${res.statusCode} response from "/wd/hub/status"`
            )
          );
          return;
        }
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}
