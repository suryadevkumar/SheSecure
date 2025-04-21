import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const mailSender = async (email, subject, body) => {
    const mailOptions = {
        from: "SheSecure <noreply@shesecure.com>",
        to: email,
        subject: `${subject}`,
        html: `${body}`
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error while sending email:', error);
                return reject(error);
            } else {
                console.log('Email sent:', info.response);
                return resolve(info);
            }
        });
    });
};

export default mailSender;