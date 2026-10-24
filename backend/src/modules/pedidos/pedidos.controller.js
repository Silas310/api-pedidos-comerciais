import Pedidos from './pedidos.model.js';


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
    const { estabelecimento_id, cliente_id, itens } = req.body;

    if (!estabelecimento_id || !cliente_id || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: 'Dados do pedido inválidos.'
      });
    }
    /* criacao de novoPedido sera feita com regras de negocio, 
    como calculo de preco total, validacao de estoque, etc.*/

  } catch (erro) {
    next(erro);
  }
}

async function atualizarStatus(req, res, next) {
  try {
    return res.status(501).json({
      erro: 'Atualização de status ainda não implementada.'
    });
  } catch (erro) {
    next(erro);
  }
}

async function excluirPedido(req, res, next) {
  try {
    return res.status(405).json({
      erro: 'Pedidos não podem ser excluídos por esta operação.'
    });
  } catch (erro) {
    next(erro);
  }
}

export {
  listarPedidos,
  buscarPedido,
  criarPedido,
  atualizarStatus,
  excluirPedido
};
