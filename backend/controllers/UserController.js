const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
    static async register(req, res) {

    const { name, email, phone, password, confirmpassword } = req.body

    // validations
    if (!name) {
        return res.status(422).json({ message: 'O nome é obrigatório' })
    }

    if (!email) {
        return res.status(422).json({ message: 'O email é obrigatório' })
    }

    if (!phone) {
        return res.status(422).json({ message: 'O telefone é obrigatório' })
    }

    if (!password) {
        return res.status(422).json({ message: 'A senha é obrigatória' })
    }

    if (!confirmpassword) {
        return res.status(422).json({ message: 'A confirmação de senha é obrigatória' })
    }

    if (password !== confirmpassword) {
        return res.status(422).json({ 
            message: 'A senha e a confirmação precisam ser iguais'
        })
    }

    // check if user exists
    const userExists = await User.findOne({ email })

    if (userExists) {
        return res.status(422).json({ 
            message: "Por favor, utilize outro e-mail!" 
        })
    }

    // create password hash
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // create user
    const user = new User({
        name,
        email,
        phone,
        password: passwordHash,
    })

    try {

        const newUser = await user.save()

        await createUserToken(newUser, req, res)

    } catch (error) {

        return res.status(500).json({ message: error })

    }
}

        static async login(req, res) {
            const {email, password} = req.body 

            if(!email) {
                res.status(422).json({ message: 'O email é obrigatório' })
                return
            }

            if(!password) {
                res.status(422).json({ message: 'A senha é obrigatória' })
                return
            }

            const user = await User.findOne({ email: email })

            if (!user) {
                res.status(422).json({
                    message: 'Não há usuário cadastrado com este email!',
                })
                return
            }

            // check if password match with db password
            const checkPassword = await bcrypt.compare(password, user.password)

            if(!checkPassword) {
                res.status(422).json({
                    message: 'Senha inválida!',
                })
                return
            }

            await createUserToken(user, req, res)
        }

        static async checkUser(req, res) {

            let currentUser

            console.log(req.headers.authorization)

            if(req.headers.authorization) {

                const token = getToken(req)
                const decoded = jwt.verify(token, 'nossosecret')

                currentUser = await User.findById(decoded.id)

                currentUser.password = undefined

            } else {
                currentUser = null
            }

            res.status(200).send(currentUser)
        }

        static async getUserById(req, res) {

            const id = req.params.id 

            const user = await User.findById(id).select('-password')

            if(!user) {
                res.status(422).json({
                    message: 'Senha inválida!',
                })
                return
            }

            res.status(200).json({ user })
        }

        static async editUser(req, res) {
            const id = req.params.id 

            // check if user exists
            const token = getToken(req)
            const user = await getUserByToken(token)

            if (!user) {
                return res.status(401).json({ message: 'Acesso negado!' })
            }

            const { name, email, phone, password, confirmpassword } = req.body

            if (req.file) {
                user.image = req.file.filename
            }

            // validations
            if(!name) {
                return res.status(422).json({ message: 'O nome é obrigatório' })
            }

            if(!email) {
                return res.status(422).json({ message: 'O email é obrigatório' })
            }
                    
            // check if email already exists
            const userExists = await User.findOne({ email: email })

            if (user.email !== email && userExists) {
                return res.status(422).json({
                    message: 'O email já está em uso!',
                })
            }

            if(!phone) {
                return res.status(422).json({ message: 'O telefone é obrigatório' })
            }

            if (password) {
            if (!confirmpassword) {
                return res.status(422).json({ 
                    message: 'A confirmação de senha é obrigatória'
                })
            }

            if (password !== confirmpassword) {
                return res.status(422).json({ 
                    message: 'A senha e a confirmação precisam ser iguais'
                })
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)
            user.password = passwordHash
        }

            await User.findByIdAndUpdate(id, {
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: user.password,
                image: user.image
            })

            // buscar usuário atualizado sem senha
            const updatedUser = await User.findById(id).select('-password')

            res.status(200).json({
                message: 'Usuário atualizado com sucesso!',
                user: updatedUser
            })
        }

        
}

