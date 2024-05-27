import express from 'express';
import bodyParser from 'body-parser';
import { USERS, ORDERS } from './db.js'; 
import { authorizationMiddleware } from './middlewares.js';
import crypto from 'crypto'; 

const app = express();

app.use(bodyParser.json());

// Function to simulate user validation
function isUserValid(token) {
  return token === "0ef5e09f-d554-4aef-9ff9-9da4d034644f"; 
}

// Function to get last 5 unique "from" addresses
function getLastFiveFromAddresses(orders) {
  const addressSet = new Set();
  const lastFive = [];
  for (let i = orders.length - 1; i >= 0 && lastFive.length < 5; i--) {
    const address = orders[i].from;
    if (!addressSet.has(address)) {
      addressSet.add(address);
      lastFive.push(address);
    }
  }
  return lastFive.reverse(); 
}

// Function to get last 3 unique "to" addresses
function getLastThreeToAddresses(orders) {
  const addressSet = new Set();
  const lastThree = [];
  for (let i = orders.length - 1; i >= 0 && lastThree.length < 3; i--) {
    const address = orders[i].to;
    if (!addressSet.has(address)) {
      addressSet.add(address);
      lastThree.push(address);
    }
  }
  return lastThree.reverse(); // Reverse for desired response format
}

// 1. API for retrieving last 5 unique "from" addresses (unchanged)
app.get('/address/from/last-five', authorizationMiddleware, (req, res) => {
  const { user } = req;

  if (!user) {
    return res.status(400).json({ error: `User not found by token: ${req.headers.authorization.split(' ')[1]}` });
  }

  const userOrders = ORDERS.filter(order => order.login === user.login);
  const lastFiveAddresses = getLastFiveFromAddresses(userOrders);

  return res.status(200).json(lastFiveAddresses);
});

// 2. API for retrieving last 3 unique "to" addresses (unchanged)
app.get('/address/to/last-three', authorizationMiddleware, (req, res) => {
  const { user } = req;

  if (!user) {
    return res.status(400).json({ error: `User not found by token: ${req.headers.authorization.split(' ')[1]}` });
  }

  const userOrders = ORDERS.filter(order => order.login === user.login);
  const lastThreeAddresses = getLastThreeToAddresses(userOrders);

  return res.status(200).json(lastThreeAddresses);
});

// 3. API for creating orders with a random price
app.post('/orders', authorizationMiddleware, (req, res) => {
  const { body, user } = req;
  const { from, to } = body;

  if (!from || !to) {
    return res.status(400).json({ message: 'Missing required fields: from or to' });
  }

  const price = Math.floor(Math.random() * (50 - 10 + 1)) + 20;

  const order = {
    from,
    to,
    login: user.login,
    price,
  };

  ORDERS.push(order);

  return res.status(200).json({ message: 'Order was created', order });
});

// 4. API for getting the lowest order by price
app.get('/orders/lowest', authorizationMiddleware, (req, res) => {
  const { user } = req;

  if (!user) {
    return res.status(400).json({ error: `User not found by token: ${req.headers.authorization.split(' ')[1]}` });
  }

  const userOrders = ORDERS 
})