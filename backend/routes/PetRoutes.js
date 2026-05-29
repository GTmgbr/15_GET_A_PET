const router = require('express').Router()

const PetController = require('../controllers/PetController')

// middlewares
const verifyToken = require('../helpers/verify-token')
const { imageUploadPets } = require('../helpers/image-upload')

// Criar pet (com upload de imagens)
router.post(
  '/create',
  verifyToken,
  imageUploadPets.array('images'),
  PetController.create
)

// Listagens
router.get('/', PetController.getAll)
router.get('/mypets', verifyToken, PetController.getAllUserPets)
router.get('/myadoptions', verifyToken, PetController.getAllUserAdoptions)

// Buscar pet por ID
router.get('/:id', PetController.getPetById)

// Ações de adoção
router.patch('/schedule/:id', verifyToken, PetController.schedule)
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption)

// Remover pet
router.delete('/:id', verifyToken, PetController.removePetById)

// Atualizar pet (com upload de novas imagens)
router.patch(
  '/:id',
  verifyToken,
  imageUploadPets.array('images'),
  PetController.updatePet
)

module.exports = router