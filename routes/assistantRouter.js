import express from 'express';
import { GoogleAssistantHelper } from '../src/googleassistant/assistantHelper';
import { HttpHelper } from '../src/httpHelper';

export let router = express();

let assistantHelper = new GoogleAssistantHelper();
let httpHelper = new HttpHelper();

router.get('/', (req, res, next) => {
    httpHelper.httpResponse({
        res,
        message: {
            msg: `Reached Google Assistant route`,
            availableRoutes: [{
                api: `/broadcast`,
                description: `Broadcast a message on Google Home Minis`,
                method: `GET`,
                params: {
                    message: `Message you want to broadcast URI encoded`
                }
            }, {
                api: `/device`,
                description: `Control a device through Google Home Mini`,
                method: `GET`,
                params: {
                    action: `on/off`,
                    device: `Name of the device recognized by Google Home`
                }
            }]
        }
    });
});

router.get('/broadcast', (req, res, next) => {
    let message = req.query.message;
    if (!message) {
        httpHelper.httpError({
            res,
            message: `message parameter is required.`
        });
    }
    assistantHelper.broadcast(message);
    httpHelper.httpResponse({
        res, 
        message: `Broadcasting ${message}`
    });
});

router.get('/device', (req, res, next) => {
    let action = req.query.action;
    let device = req.query.device;
    assistantHelper.device(action, device);
    httpHelper.httpResponse({
        res, 
        message: `${device} ${action.toUpperCase()}`
    });
});
