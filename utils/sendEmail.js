const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
const mg = mailgun.client({ username: 'api', key: process.env.MAIL_API_KEY })

const sendEmail = (email, subject, html) => {

    mg.messages.create(process.env.MAIL_API_DOMAIN, {
        from: `Paw Retriever <noreply@${process.env.MAIL_API_DOMAIN}>`,
        to: [`${email}`],
        subject: `${subject}`,
        html: `${html}`,
    })
    .then(msg => console.log(msg))
    .catch(err => console.log(err))
}

module.exports = sendEmail
