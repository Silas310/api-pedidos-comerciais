import 'dotenv/config';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../../src/app.js';
import db from '../../../src/config/db.js';
import { QueryTypes } from 'sequelize';


describe('Erros Pedidos', () => {
  let estabelecimentoId;
  let produtoId;
  beforeEach(async () => {
    // 1. Limpar o banco de dados antes de cada teste
    await db.query('DELETE FROM itens_pedido', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM pedidos', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM produtos', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM estabelecimentos', { type: QueryTypes.DELETE });

    // criar estabelecimento e produto válidos para os testes
    const dadosEstabelecimento = {
      nome: 'Estabelecimento Teste',
      endereco: 'Rua Teste, 123',
      telefone: '123456789',
    };

     const dadosProduto = {
      nome: "Produto Teste",
      descricao: "Descrição do produto teste",
      preco: 10.0,
      quantidade_estoque: 100,
      ativo: true,
    };

    const estabelecimentoResponse = await request(app)
      .post('/estabelecimentos')
      .send(dadosEstabelecimento);

    estabelecimentoId = estabelecimentoResponse.body.id;

    const produtoResponse = await request(app)
      .post('/produtos')
      .send({ ...dadosProduto, estabelecimento_id: estabelecimentoId });
    
    produtoId = produtoResponse.body.id;
  })


  // 400 — Dados inválidos
  it('cria pedido com dados inválidos', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({ estabelecimento_id: '', itens: [] });
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Dados inválidos');
  });
  
  it('cria pedido com ID de produto inválido', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send(
        {
          estabelecimento_id: estabelecimentoId,
          itens: [{ produto_id: 'invalid-id', quantidade: 1 }]
        }
      );
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'ID do produto inválido');

  });

  it('id malformado', async () => {
    const response = await request(app)
      .get('/pedidos/invalid-id');
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'ID do pedido inválido');
  });

  // 404 — Recursos inexistentes
  it('busca pedido inexistente', async () => {
    const response = await request(app)
      .get('/pedidos/1');
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Pedido não encontrado');
  });

  // esperando implementação
  // it('atualiza pedido inexistente', async () => {
  //   const response = await request(app)
  //     .put('/pedidos/1')
  //     .send({ quantidade: 2 });
  //   assert.strictEqual(response.status, 404);
  //   assert.strictEqual(response.body.error, 'Pedido não encontrado');
  // });

  // it('exclui pedido inexistente', async () => {
  //   const response = await request(app)
  //     .delete('/pedidos/1');
  //   assert.strictEqual(response.status, 404);
  //   assert.strictEqual(response.body.error, 'Pedido não encontrado');
  // });

  it('cria pedido com produto inexistente', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({ produto_id: 1, quantidade: 1 });
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Produto não encontrado');
  });

  it('cria pedido com estabelecimento inexistente', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({ estabelecimento_id: 1, quantidade: 1 });
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Estabelecimento não encontrado');
  });

  // 422 — Regras de negócio
  it('não permite criar pedido com estoque insuficiente', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({ produto_id: produtoId, quantidade: 101 });
    assert.strictEqual(response.status, 422);
    assert.strictEqual(response.body.error, 'Estoque insuficiente');
  });

  it('não permite criar pedido com produto inativo', async () => {
    // Atualizar o produto para inativo
    await db.query('UPDATE produtos SET ativo = false WHERE id = :produtoId', {
      replacements: { produtoId },
      type: QueryTypes.UPDATE,
    });

    const response = await request(app)
      .post('/pedidos')
      .send({ produto_id: produtoId, quantidade: 1 });
    assert.strictEqual(response.status, 422);
    assert.strictEqual(response.body.error, 'Produto está inativo');
  });
});