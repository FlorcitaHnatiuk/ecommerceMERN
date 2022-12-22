import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import infoRouter from './routes/infoRoutes.js'
import cluster from 'node:cluster';
import { cpus } from 'node:os';
import process from 'node:process';
import compression from "compression";
import logger from "./logger.js";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('connected to db');
  })
  .catch((err) => {
    logger.error(err.message);
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use('/api/upload', uploadRouter);
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/info', infoRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const numOfCpus = cpus().length 

if (cluster.isPrimary) {
  logger.info(`Number of cpus is ${numOfCpus}`)
  logger.info(`Primary ${process.pid} is running`)
  for (let i = 0; i < numOfCpus; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    logger.warn(`Worker ${worker.process.pid} died`, new Date().toLocaleString())
    cluster.fork()
  })
} else {
  const port = parseInt(process.argv[2]) || 5000;
    app.get('/', (req, res) => {
    res.send(`Worker on port ${port} - <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}`)
  }) 
  app.listen(port, err => {
    if (!err) {logger.info(`Worker on port ${port} - PID worker ${process.pid}`)}
  })
}

//=> tasklist /fi "imagename eq node.exe" => ver uso de memoria de primary y cada worker
//=> taskkill /pid <un worker id> /f
//=> taskkill /pid <primary id> /f => detengo todo el servidor

// ---- modo FORK ----
// pm2 start server.js --name="server1" --watch port
// pm2 start server.js --name="server2" --watch -- 5001
// pm2 start server.js --name="server3" --watch -- 5002

// ---- modo CLUSTER ----
// pm2 start server.js --name="server" --watch -i max server -f

// ---- FOREVER ---- => no lo logro usar por que al correr el comando se cuelga la computadora
// forever start server.js -p 8081 8082 8083
// forever stopall

// ---- NGINX ----
// tasklist /fi "imagename eq nginx.exe"
// start nginx