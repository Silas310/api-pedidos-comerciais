import Produto from './produtos.model.js'

async function listarProdutos(req, res, next) {
  try {
    const produtos = await Produto.findAll();

    return res.status(200).json(produtos);
  } catch (error) {
    next(error)
  }
}

async function buscarProduto(req, res, next) {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);

    if(!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' })
    }

    return res.status(200).json(produto);

  } catch (error) {
    next(error)
  }
}

async function criarProduto(req, res, next) {
  try {
    const { nome, descricao, preco, estoque } = req.body;
    const novoProduto = await Produto.create({
      nome,
      descricao,
      preco,
      estoque
    });

    return res.status(201).json(novoProduto);
  } catch (error) {
    next(error);
  }
}

async function reatribuirProduto(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, estoque } = req.body;


    const produto = await Produto.findByPk(id);

    if(!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const novoProduto = await produto.update({ 
      nome, 
      descricao, 
      preco, 
      estoque 
    })    

    return res.status(200).json(novoProduto);
  } catch (error) {
    next(error);
  }

}

async function atualizarProduto(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, estoque } = req.body;
    const produto = await Produto.findByPk(id);

    if(!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const produtoAtualizado = await produto.update({
      nome,
      descricao,
      preco,
      estoque
    })

    return res.status(200).json(produtoAtualizado);
  } catch (error) {
    next(error);
  }
}

async function excluirProduto(req, res, next) {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);

    if(!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    await produto.destroy();

    return res.status(200).json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    next(error);
  }
}

export {
  listarProdutos,
  buscarProduto,
  criarProduto,
  reatribuirProduto,
  atualizarProduto,
  excluirProduto
}