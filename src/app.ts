import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './user/user.routes.js';
import { subscriptionRouter } from './subscription/subscription.routes.js';
import { topicRouter } from './topic/topic.routes.js';

dotenv.config();

const app = express();

const PORT = 3000//process.env.PORT;

//Middlewares
app.use(express.json());

app.use('/api/users', userRouter);

app.use('/api/subscriptions', subscriptionRouter)

app.use('/api/topics', topicRouter);

app.use((_, res) => {
  res.status(404).send({ message: 'Resource not found' });
});

//Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
