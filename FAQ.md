# Frequently Asked Questions

### I initialized the collector but I have no collected sessions in Gravity

- try to set the option `debug` to `true`, reload the page, make actions into the page and
  and check that some events are logged in the browser console

- check if you configured collector options limiting teh session tracking:

  - option `sessionsPercentageKept`
  - option `rejectSession`

- in your [Gravity](https://gravity.smartesting.com) project configuration, check that you have not deactivated the data collection

- check that the collector option `authKkey` matches a key available in your [Gravity](https://gravity.smartesting.com) project 
