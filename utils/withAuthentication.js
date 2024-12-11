import authenticate from './authenticate';

// wrapper function for handlers that checks for authentication before calling the handler
// so we don't need to repeat the try catches and authentication checks in every handler
export function withAuthentication(handler, options = {}) {
    const { methods = [] } = options;

    return async (req, res) => {
        if (methods.includes(req.method)) {
            try {
                const user = await authenticate(req);
                req.user = user; // add the user to the request object so it's available to the handler
                return handler(req, res);
            } catch (error) {
                res.status(401).json({ error: error.message });
                return;
            }
        } else {
            // no authentication needed for this method
            return handler(req, res);
        }
    };
}
