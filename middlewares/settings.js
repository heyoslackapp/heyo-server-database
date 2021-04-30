const globals = Object.freeze({
  TEST: {
    active_cron_word: "activate-cron",
    isProducction: false,
  },
  TOKEN: {
    slack_xoxp:
      "xoxp-224498606455-233668675862-1749324479827-8f6f4e4cb1b6c2cc328bfa957109484d",
    signingSecret: "05b8ed9b7593825e6a12c95b8d3e3e6f",
    slack_xoxb: "xoxb-224498606455-1673227647654-Nugc7F0lrjakSOygENpNAiRO",
  },
  HOOKS_SLACK: {
    active: true,
    url:
      "https://hooks.slack.com/services/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",
  },
  CRON: {
    weekly: "0 0 10 * * Monday",
  },
});

const slackConsole = async (text) => {
  if (globals.HOOKS_SLACK.active) {
    await axios
      .post(globals.HOOKS_SLACK.url, { text })
      .then(function (response) {})
      .catch(function (error) {});
  }
};

module.exports = {
  globals,
  slackConsole,
};
