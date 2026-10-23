import { Router } from 'express';
import { listarPedidos, buscarPedido, criarPedido, atualizarStatus, excluirPedido } from './pedidos.controller.js';


const router = Router();

router.get('/', listarPedidos)

router.get('/:id', buscarPedido)

router.post('/', criarPedido)

router.patch('/:id/status', atualizarStatus)

router.delete('/:id', excluirPedido)


export default router;