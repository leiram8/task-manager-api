const mailgun = require("mailgun-js");

const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

const sendWelcomeEmail = (email, name) => {
    mg.messages().send({
        to: email,
        from: 'me@samples.mailgun.org',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    mg.messages().send({
        to: email,
        from: 'me@samples.mailgun.org',
        subject: 'Sorry to see you go!',
        text: `Goodbye ${name}. Is there anything we could have done to have kept you on board? Let us know!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}