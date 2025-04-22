import axios from 'axios';

const META_API_VERSION = process.env.WA_META_API_VERSION;
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;

// Template configuration
const TEMPLATE_CONFIG = {
    LOGO_URL: "https://res.cloudinary.com/dsutw41ta/image/upload/v1745004768/sheSecure/twha3m4vcwdmjw1yka5s.png",
    TEMPLATES: {
        SIGNUP_OTP: {
            name: "signup_otp",
            components: (vars) => [
                {
                    type: "header",
                    parameters: [{
                        type: "image",
                        image: { link: TEMPLATE_CONFIG.LOGO_URL }
                    }]
                },
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: "Welcome to SheSecure!" },
                        { type: "text", text: `Your OTP is: *${vars.otp}*` },
                        { type: "text", text: "Expires in 5 mins" }
                    ]
                }
            ]
        },
        LIVE_LOCATION: {
            name: "live_location",
            components: (vars) => [
                {
                    type: "header",
                    parameters: [{ type: "image", image: { link: TEMPLATE_CONFIG.LOGO_URL } }]
                },
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: `${vars.userName} is sharing their live location` }
                    ]
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: 0,
                    parameters: [{ type: "text", text: vars.locationLink }]
                }
            ]
        },
        SOS_EMERGENCY: {
            name: "sos_emergency",
            components: (vars) => [
                {
                    type: "header",
                    parameters: [{ type: "image", image: { link: TEMPLATE_CONFIG.LOGO_URL } }]
                },
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: `🚨 EMERGENCY ALERT from ${vars.userName}` },
                        { type: "text", text: `Time: ${new Date().toLocaleString()}` }
                    ]
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: 0,
                    parameters: [{ type: "text", text: vars.locationLink }]
                }
            ]
        },
        HELLO_WORLD: {
            name: "hello_world",
            language: {
                code: "en_US"
            }
        }
    }
};

const sendWhatsAppMessage = async ({ phoneNumber, templateType, variables }) => {
    // Validate required parameters

    if (!phoneNumber || !templateType) {
        throw {
            success: false,
            error: "Missing required parameters: phoneNumber and templateType"
        };
    }

    const template = TEMPLATE_CONFIG.TEMPLATES["HELLO_WORLD"];
    if (!template) {
        throw {
            success: false,
            error: "Invalid template type specified"
        };
    }

    try {
        const response = await axios.post(
            `https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phoneNumber,
                type: "template",
                template: {
                    name: template.name,
                    language: template.language,
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        return {
            success: true,
            messageId: response.data.messages[0].id,
            timestamp: response.data.messages[0].timestamp
        };
    } catch (error) {
        console.error('WhatsApp API request failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        throw {
            success: false,
            error: error.response?.data?.error?.message ||
                error.message ||
                'WhatsApp API request failed',
            statusCode: error.response?.status
        };
    }
};

export default sendWhatsAppMessage;