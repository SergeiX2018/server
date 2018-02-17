const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const mysql =  require('mysql');
const bodyParser = require('body-parser')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const cookieParser = require ('cookie-parser')
const session = require ('express-session')
const util = require('util')
const fs = require('fs');






const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'test',
    database : 'base_site',
});
connection.connect()
const query = util.promisify(connection.query).bind(connection)
const pbkdf2 = util.promisify(crypto.pbkdf2)

const app = express();
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({
        clientID: '1040207318682-sk56aq86tn7aq2n367hfk8km6jh96v0f.apps.googleusercontent.com',
        clientSecret:'Mp2edBM4ZDO5hunx_oP_X3-f',
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(token, tokenSecret, profile, done) {
    console.log(profile)
        async function findOrCreate(profile) {
            try {
                const users = await query('SELECT * FROM  users')
                for (let i = 0; i < users.length; i++) {
                    if (users[i].login === email) {
                        return done(null,users[i])

                    }

                }

                console.log(profile)
                const user = {login: email, provider: 'google'}
                const insertResult = await query('INSERT INTO `users`  SET ?', user)
                if (insertResult) {
                    return done(null,user)
                }
            } catch (error) {

                console.log(error)
                return done(error)

            }
        }

        findOrCreate(profile)
    }))


app.use(cookieParser())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({ secret: 'keyboard cat' }))
app.use(passport.initialize())
app.use(passport.session())
app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
        function(req, res) {
            res.redirect('http://localhost:63342/siite/build/index.html#/');
            });
app.get("/articles",function(req,res) {
    const id = req.query.id
    if(id) {
        connection.query('SELECT * FROM articles WHERE `id` = ' +id ,function(err, rows, fields) {
            if (err) throw err;
            res.send(JSON.stringify(rows))
            // connection.end()
        });


    }
    else{
        connection.query('SELECT * FROM articles' ,function(err, rows, fields) {
            if (err) throw err;
            res.send(JSON.stringify(rows))
            // connection.end()
        });

    }
   // connection.connect();

})
app.get("/categories",function(req,res) {
    // connection.connect();

    connection.query('SELECT * FROM categories' ,function(err, rows, fields) {
        if (err) throw err;
        res.send(JSON.stringify(rows))
        // connection.end()
    });




})
app.get("/it-news",function(req,res) {
    // connection.connect();

    connection.query('SELECT * FROM articles' ,function(err, rows, fields) {
        if (err) throw err;
        res.send(JSON.stringify(rows))
        // connection.end()
    });

})
app.get("/it-videos",function(req,res) {
    let arr = []
    for(let i =0; i<20;i++) {
        arr[i] = {
            title: "it-videos"+i,
            image:"https://itproger.com/img/tasks/1512219104.jpg",
            tag: "tag" + i,
            count:i + "уроков"
        }


    }
    res.send(JSON.stringify(arr))
})
app.get("/videos",function(req,res) {

    //connection.connect();

    connection.query('SELECT * FROM videos' ,function(err, rows, fields) {
        if (err) throw err;
        res.send(JSON.stringify(rows))
     //   connection.end()
    });




})


app.post('/registration', function  (req, res) {
 let message = {}
    const email = req.body.email
    const password = req.body.password
    async function registration(email,password) {
        try {
            const users = await query('SELECT * FROM  users')
            for(let i = 0; i<users.length; i++) {

                console.log(email, users[i].login)
                if(users[i].login===email) {
                   message.result = false
                   res.send(JSON.stringify(message))

                   return

                }
            }

            let salt = Math.random().toString(36).slice(-10)
            const hash = await pbkdf2(password,salt, 100000, 32, 'sha512')
            const user = {login:email,password:hash.toString('hex'),salt:salt}
             const insertResult = await query('INSERT INTO `users`  SET ?', user)
            if(insertResult) {
                message.result = true
                res.send(JSON.stringify(message))
            }
        } catch(error){
            message.result = false
            res.send(JSON.stringify(message))
            console.log(error)

        }
    }
    registration(email,password)



});
app.post('/login', function  (req, res) {

    const email = req.body.email
    const password = req.body.password


    let message = {}

    async function login(email, password) {
        try {
            const users = await query('SELECT * FROM  users')

            let message = {}

            for (let i = 0; i < users.length; i++) {
                if (users[i].login === email) {

                    const hash = await pbkdf2(password, users[i].salt, 100000, 32, 'sha512')
                    if (hash.toString('hex') === users[i].password) {
                        message.result = true
                        res.send(JSON.stringify(message))
                        return
                    }

                    message.result = false;
console.log(hash.toString('hex'))
                    res.send(JSON.stringify(message))

                    return
                }
            }
        }
        catch (error) {
            message.result = false
            console.log(email)
            console.log(error)
            res.send(JSON.stringify(message))
        }

    }

    login(email, password)
})
app.get('/users',function(reg,res) {
    connection.connect();

    connection.query('SELECT * FROM users' ,function(err, rows, fields) {
        if (err) throw err;
        res.send(JSON.stringify(rows))
    });

    connection.end();
})
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
})
