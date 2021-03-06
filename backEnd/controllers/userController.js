var Q = require('q');
var jwt = require('jwt-simple');
var userModel = require('../models/userModel.js');


var findUser = Q.nbind(User.findOne, User);
var createUser = Q.nbind(User.create, User);

module.exports = {
  login: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    findUser({username: username})
      .then(function (user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function (foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, 'boxing');
                res.json({token: token});
              } else {
                return next(new Error('User non-existent'));
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  createProfile: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var barterSkill = req.body.barterSkill;
    var location = req.body.location;

    findUser({username: username})
      .then(function (user) {
        if (user) {
          next(new Error('User exists, please login or try a different username!'));
        } else {
          return createUser({
            username: username,
            password: password
          });
        }
      })
      .then(function (user) {
        var token = jwt.encode(user, 'boxing');
        res.json({token: token});
      })
      .fail(function (error) {
        next(error);
      });
  },

  isAuth: function (req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header is any
    // then decode the token, which we end up being the user object
    // check to see if that user exists in the database
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'secret');
      findUser({username: user.username})
        .then(function (foundUser) {
          if (foundUser) {
            res.send(200);
          } else {
            res.send(401);
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  }
};
