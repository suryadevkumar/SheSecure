export const errorHandler = (res, statusCode, message, error) => {
    console.error(message, error);
    res.status(statusCode).json({ error: message });
};