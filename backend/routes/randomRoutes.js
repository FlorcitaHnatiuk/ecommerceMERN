import express from 'express';
import expressAsyncHandler from 'express-async-handler';

const randomRouter = express.Router();

randomRouter.get(
    '/',
    expressAsyncHandler(async (req, res) => {
        res.send('I am not implemented yet')
    })
)

export default randomRouter;