import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const mailSender=async (email,otp)=>{
    try{
    
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`
        };
        
        transporter.sendMail(mailOptions,(error, info) => {
            if (error) {
                console.error('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    }
    catch(error){
        console.log("problem in mailSender =>",error.message);
    }
}

export default mailSender;