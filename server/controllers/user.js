const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const secret = require('../../secret.js');


function register(req, res) {
  const db = req.app.get('db');
  const { username, email, password } = req.body;

  argon2
    .hash(password)
    .then(hash => {
      return db.users.insert(
        {
          username,
          email,
          password: hash,
        },
        {
          fields: ['id', 'username', 'email'],
        }
      );
    })
    .then(user => {
      const token = jwt.sign({ userId: user.id }, secret); // adding token generation
      res.status(201).json({ ...user, token });
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
}

function protected (req, res) {
 if (!req.headers.authorization) {
   return res.status(401).end();
 }

 try {
   const token = req.headers.authorization.split(' ')[1];
   jwt.verify(token, secret); // will throw an Error when token is invalid!!!
   res.status(200).json({ data: 'here is the protected data' });
 } catch (err) {
   console.error(err);
   res.status(401).end();
 }
}

function login(req, res) {
  const db = req.app.get('db');
  const { username, password } = req.body;

  db.users
    .findOne(
      {
        username,
      },
      {
        fields: ['id', 'username', 'email', 'password'],
      }
    )
    .then(user => {
      if (!user) {
        throw new Error('Invalid username');
      }

      // Here is where we check the hashed password from the database
      // with the password that was submitted by the user.
      return argon2.verify(user.password, password).then(valid => {
        if (!valid) {
          throw new Error('Incorrect password');
        }

        const token = jwt.sign({ userId: user.id }, secret);
        delete user.password; // remove password hash from returned user object
        res.status(200).json({ ...user, token });
      });
    })
    .catch(err => {
      if (
        ['Invalid username', 'Incorrect password'].includes(err.message)
      ) {
        res.status(400).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).end();
      }
    });
}


module.exports = {
	register,
	protected,
	login,
}