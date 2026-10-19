import express from 'express';
import estabelecimentoRotas from './modules/estabelecimentos/estabelecimentos.routes'
import produtoRotas from './modules/produtos/produtos.routes'


const app = express();


app.use(express.json());

app.use('/estabelecimentos', estabelecimentoRotas);
app.use('/produtos', produtoRotas);


export default app