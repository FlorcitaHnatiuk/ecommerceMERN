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
import { isPrimitive } from 'util';

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

function isPrime(num) {
  if ([2, 3].includes(num)) return true;
  else if ([2, 3].some(n => num % n == 0)) return false;
  else {
    let i = 5, w = 2;
    while((i ** 2) <= num) {
      if ( num % i == 0) return false;
      i += w
      w = 6 - w
    }
  }
  return true;
}

//const numOfCpus = cpus().length
const port = parseInt(process.argv[2]) || 5000;
const clusterMode = process.argv[3] == 'CLUSTER'

if (clusterMode && cluster.isPrimary) {

  const numOfCpus = cpus().length 
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
    const app = express()
    app.get('/', (req, res) => {
    const primes = []
    const max = Number(req.query.max) || 1000
    for (let i = 0; i < max; i++) {
      if (isPrime(i)) primes.push(i)
    }
    res.json(primes)
  }) 
  app.listen(port, err => {
    logger.info(`Express server on port ${port}`)
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