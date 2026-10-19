import { Router } from 'express'

const router = Router()


// READ
router.get("/", (req, res) => { // lista 
  console.log('listar produtos')
})

router.get('/:id', (req, res) => { // busca um

})


// CREATE
router.post('/:id', (req, res) => {

})


// UPDATE
router.put('/:id', (req, res) => { // atualiza tudo

})

router.patch('/:id', (req, res) => { // atualiza parte

})


// DELETE
router.delete('/:id', (req, res) => {

})

export default router