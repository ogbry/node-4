const express = require('express');
const massive = require('massive');

const secret = require('../secret.js');


const user = require('./controllers/user.js');



massive({
  host: 'localhost',
  port: 5432,
  database: 'node4db',
  user: 'postgres',																																																																																				
  password: 'node4db',
})
.then(db => {
	const app = express();

	app.set('db', db);
	app.use(express.json());

	app.post('/api/register', user.register);

	app.get('/api/protected/data', user.protected);

	app.post('/api/login', user.login);

	const PORT = 3001;
	app.listen(PORT, () => {
	  console.log(`Server listening on port ${PORT}`);
	});
})
.catch(console.error)