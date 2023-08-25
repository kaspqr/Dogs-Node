const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
const mg = mailgun.client({ username: 'api', key: process.env.MAIL_API_KEY })

const sendEmail = (email, subject, html) => {

    mg.messages.create('sandboxbcd5a836fe9e486fb34b1b6263e6e542.mailgun.org', {
        from: "Paw Retriever <mailgun@sandboxbcd5a836fe9e486fb34b1b6263e6e542.mailgun.org>",
        to: [`${email}`],
        subject: `${subject}`,
        html: `${html}`,
    })
    .then(msg => console.log(msg)) // Logs response data
    .catch(err => console.log(err)) // Logs any error
}

module.exports = sendEmail
