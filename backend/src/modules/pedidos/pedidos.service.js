
import db from '../../config/db.js';
import Pedido from './pedidos.model.js';
import ItemPedido from './itens-pedido.model.js';
import Produto from '../produtos/produtos.model.js';
import Estabelecimento from '../estabelecimentos/estabelecimentos.model.js';



async function validarDadosPedido(pedidoData) {
  if (
    !pedidoData ||
    !pedidoData.estabelecimento_id ||
    !Array.isArray(pedidoData.itens) ||
    pedidoData.itens.length === 0
  ) {
    throw new Error("Dados do pedido inválidos");
  }
  return true;
}


async function validarItensPedido(itens) {
  for (const item of itens) {
    // Valida formato dos itens do pedido
    if (
      !item ||
      !item.produto_id ||
      !Number.isInteger(item.quantidade) ||
      item.quantidade <= 0
    ) {
      throw new Error("Produto ou quantidade inválidos");
    }
  }
  return true;
}


async function validarEstabelecimento(estabelecimento_id, transaction) {
  const estabelecimentoValido = await Estabelecimento.findByPk(
    estabelecimento_id, // validar formato depois
    { transaction },
  );

  if (!estabelecimentoValido) {
    throw new Error('Estabelecimento não encontrado');
  }
}


function agruparItens(itens) {
  // Agrupar produtos repetidos e somar suas quantidades
  // Formato: [{ produto_id: 'uuid', quantidade: 2 }, ...]
  const itensAgrupados = new Map();
  for (const item of itens) {
    if (itensAgrupados.has(item.produto_id)) {
      const itemExistente = itensAgrupados.get(item.produto_id);
      itemExistente.quantidade += item.quantidade;
    } else {
      itensAgrupados.set(item.produto_id, {
        produto_id: item.produto_id,
        quantidade: item.quantidade,
      });
    }
  }
  return Array.from(itensAgrupados.values());
}



async function validarProduto(itens, transaction) {
  const produtosValidos = [];
  for (const item of itens) {
    const produto = await Produto.findByPk(item.produto_id, { transaction });
    if (!produto) {
      throw new Error("Produto não encontrado");
    } else if (!produto.ativo) {
      throw new Error("Produto não está ativo");
    } else if (produto.estoque < item.quantidade) {
      throw new Error(`Produto com ID ${item.produto_id} não tem estoque suficiente`);
    }
    produtosValidos.push(produto);
  }
  return produtosValidos;
}


function calcularTotal(itens, produtosValidos) {
  let total = 0;
  for (const item of itens) {
    const produto = produtosValidos.find((p) => p.id === item.produto_id);
    total += Number(produto.preco) * item.quantidade; // Verificar possiveis imprecisoes
  }
  return total;
}


async function criarRegistroPedido(estabelecimento_id, total, transaction) {
  // precisa criar so um pedido e depois criar os itens
  const novoPedido = await Pedido.create(
    {
      estabelecimento_id: estabelecimento_id,
      total: total,
      status: "PENDENTE",
    },
    { transaction },
  );
  return novoPedido;
}


async function criarItensPedido(
  novoPedido_id, 
  itensAgrupados, 
  produtosValidos, 
  transaction
) {
  // Associa itens ao pedido
  // Precisamos de apenas um id de pedido e diversos ids de produtos
  // os produtos vem junto no formato { produto_id: 'uuid', quantidade: 2 }
  // seu param é o produtosValidos.
  for (const item of itensAgrupados) {
    const produto = produtosValidos.find((p) => p.id === item.produto_id);
    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    await ItemPedido.create(
      {
        pedido_id: novoPedido_id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: produto.preco,
      },
      { transaction },
    );
  }
  return true;
}


async function atualizarEstoque(
  itensAgrupados,
  produtosValidos,
  transaction
) {
  for (const item of itensAgrupados) {
    const produto = produtosValidos.find(
      (p) => p.id === item.produto_id
    );

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    await produto.decrement("estoque", {
      by: item.quantidade,
      transaction,
    });
  }

  return true;
}


async function criarPedido(pedidoData) {
  const transaction = await db.transaction();
  try {
    await validarDadosPedido(pedidoData);

    await validarItensPedido(pedidoData.itens);

    await validarEstabelecimento(pedidoData.estabelecimento_id, transaction);

    const itensAgrupados = agruparItens(pedidoData.itens);
    const produtosValidos = await validarProduto(
      itensAgrupados,
      transaction,
    );
    const total = calcularTotal(itensAgrupados, produtosValidos);

    const novoPedido = await criarRegistroPedido(
      pedidoData.estabelecimento_id,
      total,
      transaction,
    );
    const novoPedido_id = novoPedido.id;

    await criarItensPedido(
      novoPedido_id, 
      itensAgrupados, 
      produtosValidos, 
      transaction
    );
    await atualizarEstoque(itensAgrupados, produtosValidos, transaction);

    await transaction.commit();
    return {
      ...novoPedido.toJSON(),
      itens: itensAgrupados.map((item) => {
        const produto = produtosValidos.find((p) => p.id === item.produto_id);
        return {
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: produto.preco,
        };
      }),
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
}

async function atualizarStatus(id, novoStatus) {
  // TODO: implementar atualização do status
}

async function cancelarPedido(id) {
  // TODO: implementar cancelamento do pedido
}

export {
  criarPedido,
  atualizarStatus,
  cancelarPedido
};