import express from 'express';
import estabelecimentoRotas from './modules/estabelecimentos/estabelecimentos.routes.js'
import produtoRotas from './modules/produtos/produtos.routes.js'
import pedidoRotas from './modules/pedidos/pedidos.routes.js'

const app = express();


app.use(express.json());

app.use('/estabelecimentos', estabelecimentoRotas);
app.use('/produtos', produtoRotas);
app.use('/pedidos', pedidoRotas)


export default app