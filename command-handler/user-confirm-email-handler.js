'use strict'

let ConfirmUserEmailCommand = require('../command/user/confirm-email')
let UserActivationLinkSentEvent = require('../event/user/activation-link-sent')
let tokens = require('../util/tokens')

/**
 * Send an email confirmation mail to the user
 *
 * @param {TemplateMailerClient} templateMailerClient
 * @param {object} config
 */
module.exports = (templateMailerClient, config) => {
  /**
   * {EmittedEventsHandlerRegistry} c
   */
  return (c) => {
    c.addHandler(ConfirmUserEmailCommand,
      /**
       * @param {ConfirmUserEmailCommand} cmd
       */
      (cmd) => {
        return tokens.accountActivationToken(config.get('api_host'), config.get('private_key'), config.get('token_lifetime'), cmd.user)
          .then((token) => {
            return templateMailerClient
              .send('networhk', 'networhk-email-verification', cmd.email.toString(), cmd.user.name(), {
                recipient: {
                  firstname: cmd.user.firstname,
                  lastname: cmd.user.lastname
                },
                link: config.get('web_host') + '/#!/activate/' + token.token,
                webHost: config.get('web_host')
              })
              .then(() => {
                return new UserActivationLinkSentEvent(cmd.user, token)
              })
          })
      })
  }
}
