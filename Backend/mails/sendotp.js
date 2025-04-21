
export const sendotp = (otp) => {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SheSecure OTP Verification</title>
                <style>
                    /* Base styles */
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #8e44ad, #9b59b6);
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .logo {
                        height: 60px;
                        width: auto;
                        margin-bottom: 15px;
                    }
                    .content {
                        padding: 30px;
                    }
                    .otp-box {
                        background-color: #f5f5f5;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 25px 0;
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 5px;
                        color: #8e44ad;
                        border: 1px dashed #d1d1d1;
                    }
                    .footer {
                        background-color: #f1f1f1;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                    }
                    h1 {
                        color: white;
                        margin: 0;
                        font-size: 24px;
                    }
                    p {
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #8e44ad;
                        color: white !important;
                        text-decoration: none;
                        padding: 12px 25px;
                        border-radius: 5px;
                        font-weight: bold;
                        margin: 15px 0;
                    }
                    .small {
                        font-size: 12px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <!-- Replace with your actual logo URL -->
                        <img src="https://res.cloudinary.com/dsutw41ta/image/upload/v1745004768/sheSecure/twha3m4vcwdmjw1yka5s.png" alt="SheSecure Logo" class="logo">
                        <h1>OTP Verification</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello,</p>
                        <p>Thank you for choosing <strong>SheSecure</strong> - Your trusted women safety partner.</p>
                        <p>To complete your verification, please use the following One-Time Password (OTP):</p>
                        
                        <div class="otp-box">
                            <!-- OTP will be dynamically inserted here -->
                            ${otp}
                        </div>
                        
                        <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.</p>
                        
                        <p>If you didn't request this OTP, please ignore this email or contact our support team immediately.</p>
                        
                        <p>Stay safe,<br>The SheSecure Team</p>
                        
                        <p class="small">This is an automated message. Please do not reply directly to this email.</p>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 2025 SheSecure. All rights reserved.</p>
                        <p>123 Safety Street, Secure City, MANIT, Bhopal</p>
                        <p>
                            <a href="http://localhost:5173/" style="color: #8e44ad; text-decoration: none;">Website</a> | 
                            <a href="https://shesecure.com/privacy" style="color: #8e44ad; text-decoration: none;">Privacy Policy</a> | 
                            <a href="http://localhost:5173/" style="color: #8e44ad; text-decoration: none;">Contact Us</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>`
}