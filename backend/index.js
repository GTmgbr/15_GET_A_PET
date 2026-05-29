const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

require('./db/conn')

// Config JSON response
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

// Routes 
const UserRoutes = require('./routes/UserRoutes')
const PetRoutes = require('./routes/PetRoutes')

app.use('/users', UserRoutes)
app.use('/pets', PetRoutes)
app.use('/images/pets', express.static(path.join(__dirname, 'public/images/pets')))

// rota específica para imagens
app.use('/images/users', express.static(path.join(__dirname, 'public/images/users')))

app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000')
})

