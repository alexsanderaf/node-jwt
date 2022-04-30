const mongoose = require('mongoose')
require('dotenv').config()


const connection = () => {
    const dbUser = process.env.DB_USER
    const dbPass = process.env.DB_PASS

    mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.31pmv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`).then(() => {
        console.log('Conectou ao banco!')
    }).catch((err) => console.log(err))
    
}

module.exports = connection