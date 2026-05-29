const mongoose = require('mongoose')

async function main() {

    await mongoose.connect(
        `mongodb+srv://${process.env.GTmgbr}:${process.env.1234}@cluster0.s2be24w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    )

    console.log('Conectou ao MongoDB Atlas!')
}

main().catch((err) => console.log(err))

module.exports = mongoose