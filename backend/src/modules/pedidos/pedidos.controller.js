
import Pedidos from './pedidos.model.js';
import { criarPedido as criarPedidoService } from './pedidos.service.js';


async function listarPedidos(req, res, next) {
  try {
    const { estabelecimento_id, status } = req.query;

    const where = {};

    if (estabelecimento_id) {
      where.estabelecimento_id = estabelecimento_id;
    }

    if (status) {
      where.status = status;
    }

    const pedidos = await Pedidos.findAll({ where });

    return res.status(200).json(pedidos);
  } catch (erro) {
    next(erro);
  }
}

async function buscarPedido(req, res, next) {
  try {
    const { id } = req.params;

    const pedido = await Pedidos.findByPk(id);

    if (!pedido) {
      return res.status(404).json({
        erro: 'Pedido não encontrado.'
      });
    }

    return res.status(200).json(pedido);
  } catch (erro) {
    next(erro);
  }
}

async function criarPedido(req, res, next) {
  try {
    const { estabelecimento_id, itens } = req.body;

    if (
      !estabelecimento_id ||
      !Array.isArray(itens) ||
      itens.length === 0
    ) {
      return res.status(400).json({
        erro: 'Dados do pedido inválidos.',
      });
    }

    const pedido = await criarPedidoService({
      estabelecimento_id,
      itens,
    });

    return res.status(201).json(pedido);
  } catch (erro) {
    console.error('Erro ao criar pedido:', erro);
    next(erro);
  }
}

async function atualizarStatus(req, res, next) {
  return res.status(501).json({
    erro: 'Atualização de status ainda não implementada.'
  });
}

async function excluirPedido(req, res, next) {
  return res.status(405).json({
    erro: 'Pedidos não podem ser excluídos por esta operação.'
  });
}

export {
  listarPedidos,
  buscarPedido,
  criarPedido,
  atualizarStatus,
  excluirPedido
};
