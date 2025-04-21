

export const sendCustomerCareEmail = (firstName, lastName, email, mobileNumber, subject, message) => {
    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Customer Query - SheSecure</title>
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
                        background: linear-gradient(135deg, #6C63FF, #8B83FF);
                        padding: 30px 20px;
                        text-align: center;
                    }
                    
                    .logo {
                        height: 50px;
                        width: auto;
                        margin-bottom: 15px;
                    }
                    
                    .content {
                        padding: 30px;
                    }
                    
                    .details-card {
                        background-color: #F8F9FF;
                        border-radius: 8px;
                        padding: 25px;
                        margin: 20px 0;
                        border-left: 4px solid #6C63FF;
                    }
                    
                    .detail-row {
                        margin-bottom: 15px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #f0f0f0;
                        display: flex;
                    }
                    
                    .detail-row:last-child {
                        margin-bottom: 0;
                        padding-bottom: 0;
                        border-bottom: none;
                    }
                    
                    .detail-label {
                        font-weight: 600;
                        color: #6C63FF;
                        width: 120px;
                        flex-shrink: 0;
                        font-size: 14px;
                    }
                    
                    .detail-value {
                        font-size: 15px;
                        color: #333;
                        flex-grow: 1;
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
                        white-space: pre-wrap;
                    }
                    
                    .priority-tag {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 600;
                        margin-left: 10px;
                    }
                    
                    .priority-high {
                        background-color: #FFEEEE;
                        color: #FF6B6B;
                    }
                    
                    .priority-normal {
                        background-color: #EEF7FF;
                        color: #4D96FF;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <!-- Replace with your actual logo URL -->
                        <img src="https://res.cloudinary.com/dsutw41ta/image/upload/v1745004768/sheSecure/twha3m4vcwdmjw1yka5s.png" alt="SheSecure Logo" class="logo">
                        <h1>New Customer Query Received</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hello SheSecure Team,</p>
                        <p>A new customer query has been submitted through our support system. Please find the details below:</p>
                        
                        <div class="details-card">
                            <div class="detail-row">
                                <span class="detail-label">Customer Name</span>
                                <span class="detail-value">${firstName} ${lastName}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Email</span>
                                <span class="detail-value">${email}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Phone</span>
                                <span class="detail-value">${mobileNumber}</span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Query Subject</span>
                                <span class="detail-value">
                                    ${subject}
                                </span>
                            </div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Message</span>
                                <div class="message-content">
                                    ${message}
                                </div>
                            </div>
                        </div>
                        
                        <p><strong>Action Required:</strong> Please respond to this query within 24 hours.</p>
                        
                        <p>You can contact the customer directly at <a href="mailto:${email}">${email}</a>${mobileNumber ? ` or <a href="tel:${mobileNumber}">${mobileNumber}</a>` : ''}.</p>
                        
                        <p>Best regards,<br>The SheSecure Support System</p>
                    </div>
                    
                    <div class="footer">
                        <p>&copy;SheSecure. All rights reserved.</p>
                        <p>123 Security Avenue, Safetown, MANIT, Bhopal</p>
                        <p>
                            <a href="https://shesecure.com" style="color: #6C63FF; text-decoration: none;">Website</a> | 
                            <a href="https://shesecure.com/privacy" style="color: #6C63FF; text-decoration: none;">Privacy Policy</a> | 
                            <a href="https://shesecure.com/contact" style="color: #6C63FF; text-decoration: none;">Contact Us</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>`
}