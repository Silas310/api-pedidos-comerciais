import db from '../../config/db.js';
import Pedido from './pedidos.model.js';
import ItemPedido from './itens-pedido.model.js';
import Produto from '../produtos/produtos.model.js';
import Estabelecimento from '../estabelecimentos/estabelecimentos.model.js';


async function criarPedido(pedidoData) {
  // Essa função cria um novo pedido no banco de dados.
  // Também cria os itens associados ao pedido.
  // Todas as operações de escrita devem ocorrer em uma transação.

  // Formato de pedidoData:
  /*
  {
    "estabelecimento_id": "uuid",
    "itens": [
      {
        "produto_id": "uuid",
        "quantidade": 2
      }
    ]
  }
  */

  // 1. Validar os dados recebidos
  // 2. Iniciar a transação
  // 3. Validar o estabelecimento e os produtos
  // 4. Obter os preços reais e calcular o total
  // 5. Criar o pedido
  // 6. Criar os itens associados ao pedido
  // 7. Atualizar o estoque
  // 8. Confirmar a transação ou revertê-la em caso de erro

  // 1. Validar os dados recebidos
  if (
    !pedidoData ||
    !pedidoData.estabelecimento_id ||
    !Array.isArray(pedidoData.itens) ||
    pedidoData.itens.length === 0
  ) {
    throw new Error("Dados do pedido inválidos");
  }

  // Agrupar produtos repetidos e somar suas quantidades
  const itensAgrupados = new Map();

  for (const item of pedidoData.itens) {
    // Valida formato dos itens do pedido
    if (
      !item ||
      !item.produto_id ||
      !Number.isInteger(item.quantidade) ||
      item.quantidade <= 0
    ) {
      throw new Error("Produto ou quantidade inválidos");
    }

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

  const itens = Array.from(itensAgrupados.values());

  // 2. Iniciar a transação
  const transaction = await db.transaction();

  // 3. Validar o estabelecimento e os produtos
  try {
    // 3.1 Validar se o estabelecimento existe
    const estabelecimento = await Estabelecimento.findByPk(
      pedidoData.estabelecimento_id, // verificar tipo de dado do id
      { transaction },
    );
    if (!estabelecimento) {
      throw new Error("Estabelecimento não encontrado");
    }

    // 3.2 Validar se produtos estao ativos e estoque suficiente e guardar
    const produtosValidos = [];

    for (const item of itens) {
      // verificar tipo de dado do id
      const produto = await Produto.findByPk(item.produto_id, { transaction });

      if (!produto) {
        throw new Error(`Produto com ID ${item.produto_id} não encontrado`);
      }
      if (!produto.ativo) {
        throw new Error(`Produto com ID ${item.produto_id} não está ativo`);
      }
      if (produto.estoque < item.quantidade) {
        throw new Error(
          `Produto com ID ${item.produto_id} não tem estoque suficiente`,
        );
      }

      produtosValidos.push(produto);
    }

    // 4. Obter os preços reais e calcular o total
    let total = 0;
    for (const item of itens) {
      const produto = produtosValidos.find((p) => p.id === item.produto_id);
      total += Number(produto.preco) * item.quantidade; // Verificar possiveis imprecisoes
    }

    // 5. Criar o pedido
    const novoPedido = await Pedido.create(
      {
        estabelecimento_id: pedidoData.estabelecimento_id,
        total: total,
        status: "PENDENTE",
      },
      { transaction },
    );

    // 6. Criar os itens associados ao pedido
    for (const item of itens) {
      const produto = produtosValidos.find((p) => p.id === item.produto_id);

      await ItemPedido.create(
        {
          pedido_id: novoPedido.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: produto.preco,
        },
        { transaction },
      );
    }

    // 7. Atualizar o estoque
    for (const item of itens) {
      const produto = produtosValidos.find((p) => p.id === item.produto_id);
      await produto.decrement("estoque", { by: item.quantidade, transaction });
    }

    // 8. Confirmar a transação
    await transaction.commit();

    return {
      ...novoPedido.toJSON(),
      itens: itens.map((item) => {
        const produto = produtosValidos.find((p) => p.id === item.produto_id);

        return {
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: produto.preco,
        };
      }),
    };
  } catch (error) {
    await transaction.rollback();
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