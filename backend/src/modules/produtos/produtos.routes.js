import { Router } from 'express'
import {listarProdutos, buscarProduto, criarProduto, reatribuirProduto, atualizarProduto, excluirProduto} from './produtos.controller.js'

const router = Router()


// READ
router.get("/", listarProdutos) // lista todos

router.get('/:id', buscarProduto) // busca um


// CREATE
router.post('/', criarProduto) // cria um


// UPDATE
router.put('/:id', reatribuirProduto) // atualiza tudo

router.patch('/:id', atualizarProduto) // atualiza parte


// DELETE
router.delete('/:id', excluirProduto)


export default router