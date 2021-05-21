export class HttpHelper {
    constructor() { }

    httpResponse({ res, message }) {
        try {
            message = JSON.parse(message);
        } catch (e) {
            
        }

        res.jsonp({
            status: `ok`,
            message
        });
    }

    httpResponseJSON({ res, json }) {
        res.jsonp({
            status: `ok`,
            json
        })
    }
}