import { Router } from 'express'
import { listarEstabelecimentos, buscarEstabelecimento, criarEstabelecimento, reatribuirEstabelecimento, atualizarEstabelecimento, apagarEstabelecimento } from './estabelecimentos.controller.js'

const router = Router()


// READ
router.get("/", listarEstabelecimentos)

router.get('/:id', buscarEstabelecimento)


// CREATE
router.post('/', criarEstabelecimento)


// UPDATE
router.put('/:id', reatrribuirEstabelecimento)

router.patch('/:id', atualizarEstabelecimento)


// DELETE
router.delete('/:id', apagarEstabelecimento)


export default router