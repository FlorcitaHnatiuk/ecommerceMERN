import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';

const infoRouter = express.Router();

infoRouter.get(
    '/info',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const info = {
            port: process.port,
            path: process.cwd(),
            processId: process.pid,
            nodeVersion: process.version,
            title: process.title,
            system: process.platform,
            memory: process.memoryUsage.rss(),
            filePath: __dirname,
        };
        res.send(info);
    })
)

export default infoRouter;