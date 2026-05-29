const Pet = require('../models/Pet')

// helpers
const getToken = require("../helpers/get-token")
const getUserByToken = require("../helpers/get-user-by-token")
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class PetController {

    // create a pet
    static async create(req, res) {

        const { name, age, weight, color } = req.body
        const images = req.files
        const available = true

        // validations
        if (!name) {
            return res.status(422).json({ message: "O nome é obrigatório!" })
        }

        if (!age) {
            return res.status(422).json({ message: "A idade é obrigatória!" })
        }

        if (!weight) {
            return res.status(422).json({ message: "O peso é obrigatório!" })
        }

        if (!color) {
            return res.status(422).json({ message: "A cor é obrigatória!" })
        }

        if (!images || images.length === 0) {
            return res.status(422).json({ message: "A imagem é obrigatória!" })
        }

        // get pet owner
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        })

        images.map((image) => {
            pet.images.push(image.filename)
        })

        try {

            const newPet = await pet.save()

            return res.status(201).json({
                message: 'Pet cadastrado com sucesso!',
                newPet,
            })

        } catch (error) {

            return res.status(500).json({ message: error })

        }
    }

    // get all pets
    static async getAll(req, res) {

        const pets = await Pet.find().sort({ createdAt: -1 })

        return res.status(200).json({
            pets: pets,
        })

    }

    // get all user pets
    static async getAllUserPets(req, res) {

        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet
            .find({ "user._id": user._id })
            .sort({ createdAt: -1 })

        return res.status(200).json({ pets })

    }

    // get all user adoptions
    static async getAllUserAdoptions(req, res) {

        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet
            .find({ "adopter._id": user._id })
            .sort({ createdAt: -1 })

        return res.status(200).json({ pets })

    }

    // get pet by id
    static async getPetById(req, res) {

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido!" })
        }

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            return res.status(404).json({ message: 'Pet não encontrado' })
        }

        return res.status(200).json({ pet })

    }

    // remove pet by id
    static async removePetById(req, res) {

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: 'ID inválido!' })
        }

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            return res.status(404).json({ message: 'Pet não encontrado' })
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(422).json({
                message: 'Houve um problema em processar a sua solicitação!'
            })
        }

        await Pet.findByIdAndDelete(id)

        return res.status(200).json({
            message: 'Pet removido com sucesso!'
        })

    }

    // update pet
    static async updatePet(req, res) {

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "ID inválido!" })
        }

        const { name, age, weight, color, available } = req.body || {}
        const images = req.files

        const updatedData = {}

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            return res.status(404).json({ message: 'Pet não encontrado' })
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(422).json({
                message: 'Houve um problema em processar a sua solicitação!'
            })
        }

        // update fields
        if (name) {
            updatedData.name = name
        }

        if (age) {
            updatedData.age = age
        }

        if (weight) {
            updatedData.weight = weight
        }

        if (color) {
            updatedData.color = color
        }

        if (available !== undefined) {
            updatedData.available = available
        }

        if (images && images.length > 0) {

            updatedData.images = []

            images.map((image) => {
                updatedData.images.push(image.filename)
            })

        }

        await Pet.findByIdAndUpdate(id, updatedData)

        return res.status(200).json({
            message: "Pet atualizado com sucesso!"
        })

    }

    // schedule visit
    static async schedule(req, res) {

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: 'ID inválido!' })
        }

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            return res.status(404).json({ message: 'Pet não encontrado!' })
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        // impedir agendamento do próprio pet
        if (pet.user._id.toString() === user._id.toString()) {
            return res.status(422).json({
                message: 'Você não pode agendar uma visita com o seu próprio Pet!'
            })
        }

        // impedir múltiplos agendamentos
        if (
            pet.adopter &&
            pet.adopter._id &&
            pet.adopter._id.toString() === user._id.toString()
        ) {
            return res.status(422).json({
                message: 'Você já agendou uma visita para este Pet!'
            })
        }

        // salvar adotante corretamente
        await Pet.findByIdAndUpdate(id, {
            adopter: {
                _id: user._id,
                name: user.name,
                image: user.image
            }
        })

        return res.status(200).json({
            message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`
        })
    }

    // conclude adoption
    static async concludeAdoption(req, res) {

        const id = req.params.id

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            return res.status(404).json({ message: 'Pet não encontrado!' })
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        // verificar se é o dono do pet
        if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(422).json({
                message: 'Houve um problema em processar a sua solicitação!'
            })
        }

        pet.available = false

        await Pet.findByIdAndUpdate(id, pet)

        return res.status(200).json({
            message: 'Parabéns! O ciclo de adoção foi finalizado'
        })
    }

}