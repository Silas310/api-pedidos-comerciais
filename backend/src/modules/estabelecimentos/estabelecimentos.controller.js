import Estabelecimento from './estabelecimentos.model.js';


async function listarEstabelecimentos(req, res, next) {
  try {
    const estabelecimentos = await Estabelecimento.findAll();

    return res.status(200).json(estabelecimentos);
  } catch (error) {
    next(error)
  }
}

async function buscarEstabelecimento(req, res, next) {
  try {
    const { id} = req.params;
    const estabelecimento = await Estabelecimento.findByPk(id);

    if (!estabelecimento) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado' });
    }

    return res.status(200).json(estabelecimento);
  } catch (error) {
    next(error)
  }
}

async function criarEstabelecimento(req, res, next) {
  try {
    const { nome, endereco, telefone } = req.body;
    const novoEstabelecimento = await Estabelecimento.create({ 
      nome, 
      endereco, 
      telefone 
    });

    return res.status(201).json(novoEstabelecimento);
  } catch (error) {
    next(error)
  }
}


async function reatribuirEstabelecimento(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, endereco, telefone } = req.body;

    const estabelecimento = await Estabelecimento.findByPk(id);

    if (!estabelecimento) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado' });
    }

    const estabelecimentoAtualizado = await estabelecimento.update({ 
      nome, 
      endereco, 
      telefone 
    });

    return res.status(200).json(estabelecimentoAtualizado);
  } catch (error) {
    next(error)
  }
}


async function atualizarEstabelecimento(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, endereco, telefone } = req.body;
    const estabelecimento = await Estabelecimento.findByPk(id);

    if (!estabelecimento) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado' });
    }

    const estabelecimentoAtualizado = await estabelecimento.update({ nome, endereco, telefone });
    return res.status(200).json(estabelecimentoAtualizado);
  } catch (error) {
    next(error)
  }
}


async function apagarEstabelecimento(req, res, next) {
  try {
    const { id } = req.params;
    const estabelecimento = await Estabelecimento.findByPk(id);

     if (!estabelecimento) {
      return res.status(404).json({ message: 'Estabelecimento não encontrado' });
    }

    await estabelecimento.destroy();
    return res.status(204).end();
  } catch (error) {
    next(error)
  }
}

export {
  listarEstabelecimentos,
  buscarEstabelecimento,
  criarEstabelecimento,
  reatribuirEstabelecimento,
  atualizarEstabelecimento,
  apagarEstabelecimento
}