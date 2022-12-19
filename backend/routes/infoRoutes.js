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
            titulo: process.title,
            sistema: process.platform,
            memory: process.memoryUsage.rss(),
            file: __dirname,
        };
        // info.keys = Object.keys(info);
        console.log(
            "Directorio actual de trabajo:" + process.cwd() + "\n",
            "Id del Proceso:" + process.pid + "\n",
            "Version de Node:" + process.version + "\n",
            "Titulo del proceso:" + process.title + "\n",
            "Sistema Operativo:" + process.platform + "\n",
            "Uso de Memoria:" + process.memoryUsage.rss() + "\n"
        );
        res.send(info);
    })
)

export default infoRouter;