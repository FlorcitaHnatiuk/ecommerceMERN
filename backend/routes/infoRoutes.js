import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';

const infoRouter = express.Router();

infoRouter.get(
    '/',
    expressAsyncHandler(async (req, res) => {
        const info = {
            port: process.port,
            path: process.cwd(),
            processId: process.pid,
            nodeVersion: process.version,
            title: process.title,
            system: process.platform,
            memory: process.memoryUsage.rss(),
        };
        res.send(info);
    })
)

export default infoRouter;