import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_SECRET
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

// Define custom NodeMailer error type
interface NodemailerError extends Error {
    responseCode?: number;
}

const sendEmail = ({ to, subject, html }: EmailOptions): Promise<SentMessageInfo> => {
    const options = {
        from: `Genify <${process.env.MAIL_EMAIL}>`,
        to,
        subject,
        html
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (err: NodemailerError | null, info: SentMessageInfo) => {
            if (err) {
                console.error('Error sending email:', err.message, err.responseCode);
                reject(err);
            } else {
                console.log('Email sent:', info?.response);
                resolve(info);
            }
        });
    });
};

export default sendEmail; 