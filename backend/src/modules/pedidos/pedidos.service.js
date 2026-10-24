import db from '../../config/db.js';
import Pedido from './pedidos.model.js';
import ItemPedido from './itens-pedido.model.js';
import Estabelecimento from '../estabelecimentos/estabelecimentos.model.js';


async function criarPedido(pedidoData) {
  // Essa função cria um novo pedido no banco de dados.
  // Também cria os itens associados ao pedido.
  // Todas as operações de escrita devem ocorrer em uma transação.

  // Formato de pedidoData: ...

  // 1. Validar os dados recebidos
  // 2. Iniciar a transação
  // 3. Validar o estabelecimento e os produtos
  // 4. Obter os preços reais e calcular o total
  // 5. Criar o pedido
  // 6. Criar os itens associados ao pedido
  // 7. Atualizar o estoque
  // 8. Confirmar a transação ou revertê-la em caso de erro
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
