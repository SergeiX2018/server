const crypto = require('crypto');
crypto.pbkdf2('secret1', 'salt1', 100000, 64, 'sha512', (err, derivedKey) => {
    if (err) throw err;
    console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
});