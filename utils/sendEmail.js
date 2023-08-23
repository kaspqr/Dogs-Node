const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)
const mg = mailgun.client({ username: 'api', key: process.env.MAIL_API_KEY })

const sendEmail = (email, subject, text) => {

    const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #007bff;
                    color: white;
                    text-align: center;
                    padding: 10px;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }
                .content {
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .button-text {
                    color: white;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Email Verification</h1>
                </div>
                <div class="content">
                    <p>Thank you for signing up! To verify your email address, please click the button below:</p>
                    <a class="button" href="${text}">
                        <b class="button-text">Verify Email</b>
                    </a>
                    <p>If the verification button does not work, please go to the link below</p>
                    <p>If you didn't sign up for this, you can safely ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        <noscript>
            Verification link:
            ${text}
        </noscript>
    `

    mg.messages.create('sandboxbcd5a836fe9e486fb34b1b6263e6e542.mailgun.org', {
        from: "Paw Retriever <mailgun@sandboxbcd5a836fe9e486fb34b1b6263e6e542.mailgun.org>",
        to: [`${email}`],
        subject: `${subject}`,
        html: `${emailHTML}`,
    })
    .then(msg => console.log(msg)) // Logs response data
    .catch(err => console.log(err)) // Logs any error
}

module.exports = sendEmail
