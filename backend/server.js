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
import http from 'node:http';
import { cpus } from 'node:os';
import process from 'node:process';

const numOfCpus = cpus().length
console.log(numOfCpus)

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

//Cuando saco de acá el app listen y solo lo ubico dentro del else de workers, status 500.
//Intenté poniendo la función cluster abajo de todo y tampoco funciona. No logro solucionarlo.
// const port = parseInt(process.argv[2]) || 5000;
// app.listen(port, () => {
//   console.log(`Express server at http://localhost:${port} - PID WORKER ${process.pid}`);
// }); 

if (cluster.isPrimary) {
  console.log(cpus)
  console.log(`Primary ${process.pid} is running`)
  for (let i = 0; i < 4; i++) {
    cluster.fork();
  }
  //Si se cae uno va a crearse otro y va a volver al comienzo del if y asi seguimos a max capacidad
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`, new Date().toLocaleString())
    cluster.fork()
  })
} else {
  const port = parseInt(process.argv[2]) || 5000;
    app.get('/', (req, res) => {
    console.log(`Express Server on port ${port} - <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}`)
    res.send(`Express Server on port ${port} - <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}`)
  }) 
  app.listen(port, err => {
    if (!err) {console.log(`Express server on port ${port} - PID worker ${process.pid}`)}
  })
}

// ---- modo CLUSTER ----
// pm2 start server.js --name="server" --watch -i max PORT