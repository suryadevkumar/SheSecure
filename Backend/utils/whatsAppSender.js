import axios from 'axios';

const META_API_VERSION = process.env.WA_META_API_VERSION;
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;
const TEMPLATE_NAMESPACE = process.env.WA_TEMPLATE_NAMESPACE;

// Template configuration
const TEMPLATE_CONFIG = {
    TEMPLATES: {
        SIGNUP_OTP: {
            name: "signup_otp",
            language: {
                code: "en",
                policy: "deterministic"
            },
            components: (vars) => [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: vars.otp }
                    ]
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: 0,
                    parameters: [
                        { type: "text", text: vars.otp }
                    ]
                }
            ]
        },
        LIVE_LOCATION: {
            name: "live_location",
            language: {
                code: "en",
                policy: "deterministic"
            },
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
            language: {
                code: "en",
                policy: "deterministic"
            },
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
                code: "en_US",
                policy: "deterministic"
            }
        }
    }
};

const sendWhatsAppMessage = async ({ phoneNumber, templateType, variables }) => {
    if (!phoneNumber || !templateType) {
        throw {
            success: false,
            error: "Missing required parameters: phoneNumber and templateType"
        };
    }

    const template = TEMPLATE_CONFIG.TEMPLATES[templateType];
    if (!template) {
        throw {
            success: false,
            error: "Invalid template type specified"
        };
    }

    try {
        const requestBody = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phoneNumber,
            type: "template",
            template: {
                name: template.name,
                namespace: TEMPLATE_NAMESPACE,
                language: template.language,
            }
        };

        if (template.components) {
            requestBody.template.components = template.components(variables);
        }

        const response = await axios.post(
            `https://graph.facebook.com/${META_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
            requestBody,
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
            messageId: response.data.messages[0]?.id,
            timestamp: response.data.messages[0]?.timestamp
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
