
export const contactUs = (name, email, date, subject, message) => {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Contact-Us Form Submission - SheSecure</title>
                <style>
                    /* Base styles */
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #FF6B8B, #FF8E9E);
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
                    .details-card {
                        background-color: #FFF9F9;
                        border-radius: 8px;
                        padding: 25px;
                        margin: 20px 0;
                        border-left: 4px solid #FF6B8B;
                    }
                    .detail-row {
                        margin-bottom: 15px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #f0f0f0;
                    }
                    .detail-row:last-child {
                        margin-bottom: 0;
                        padding-bottom: 0;
                        border-bottom: none;
                    }
                    .detail-label {
                        font-weight: 600;
                        color: #FF6B8B;
                        display: block;
                        margin-bottom: 5px;
                        font-size: 14px;
                    }
                    .detail-value {
                        font-size: 16px;
                        color: #333;
                    }
                    .footer {
                        background-color: #f9f9f9;
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
                    .message-content {
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 6px;
                        margin-top: 10px;
                        font-size: 15px;
                        line-height: 1.6;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <!-- Replace with your actual logo URL -->
                        <img src="https://res.cloudinary.com/dsutw41ta/image/upload/v1745004768/sheSecure/twha3m4vcwdmjw1yka5s.png" alt="SheSecure Logo" class="logo">
                        <h1>New Contact-Us Form Submission</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello SheSecure Team,</p>
                        <p>You've received a new message through the contact Us form. Here are the details:</p>
                        
                        <div class="details-card">
                            <div class="detail-row">
                                <span class="detail-label">From</span>
                                <span class="detail-value">${name} &lt;${email}&gt;</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Subject</span>
                                <span class="detail-value">${subject}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Date</span>
                                <span class="detail-value">${date}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Message</span>
                                <div class="message-content">
                                ${message}
                                </div>
                            </div>
                        </div>
                        
                        <p>Please respond to this inquiry within 24 hours.</p>
                        
                        <p>Stay safe,<br>The SheSecure System</p>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 20265 SheSecure. All rights reserved.</p>
                        <p>123 Safety Street, Secure City, SC 12345</p>
                        <p>
                            <a href="https://shesecure.com" style="color: #FF6B8B; text-decoration: none;">Website</a> | 
                            <a href="https://shesecure.com/privacy" style="color: #FF6B8B; text-decoration: none;">Privacy Policy</a> | 
                            <a href="https://shesecure.com/contact" style="color: #FF6B8B; text-decoration: none;">Contact Us</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>`
}