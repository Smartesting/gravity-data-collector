# Frequently Asked Questions

### I initialized the collector but I have no collected sessions in Gravity

Here are some tips (non-exhaustive list) to help you to face this problem:

- if you configured the option `debug` to `true`, then the session events are not sent to Gravity server. It's a "dry run" mode.

- try to set the option `debug` to `true`, reload the page, make actions into the page and
  and check that some events are logged in the browser console.

- check if you configured collector options limiting the session tracking:

  - optional property `sessionsPercentageKept` decides randomly to skip a session
  - optional function `rejectSession` may be too 'strong' and rejects any session

- in your [Gravity](https://gravity.smartesting.com) project configuration, check that you have not deactivated the data collection

- check that the collector option `authKkey` matches a key available in your [Gravity](https://gravity.smartesting.com) project
