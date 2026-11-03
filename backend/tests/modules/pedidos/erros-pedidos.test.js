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

  const uuidInexistente = '00000000-0000-0000-0000-000000000000';

  beforeEach(async () => {
    // Limpar o banco de dados antes de cada teste
    await db.query('DELETE FROM itens_pedido', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM pedidos', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM produtos', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM estabelecimentos', { type: QueryTypes.DELETE });

    // Criar estabelecimento e produto válidos para os testes
    const dadosEstabelecimento = {
      nome: 'Estabelecimento Teste',
      endereco: 'Rua Teste, 123',
      telefone: '123456789',
    };

    const dadosProduto = {
      nome: 'Produto Teste',
      descricao: 'Descrição do produto teste',
      preco: 10.0,
      estoque: 100,
      ativo: true,
    };

    const estabelecimentoResponse = await request(app)
      .post('/estabelecimentos')
      .send(dadosEstabelecimento);

    assert.strictEqual(
      estabelecimentoResponse.status,
      201,
      JSON.stringify(estabelecimentoResponse.body)
    );

    estabelecimentoId = estabelecimentoResponse.body.id;

    const produtoResponse = await request(app)
      .post('/produtos')
      .send(dadosProduto);

    assert.strictEqual(
      produtoResponse.status,
      201,
      JSON.stringify(produtoResponse.body)
    );

    produtoId = produtoResponse.body.id;
  });

  // 400 — Dados inválidos
  it('cria pedido com dados inválidos', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({
        estabelecimento_id: 'invalid-id',
        itens: [{ produto_id: 'invalid-id', quantidade: -1 }]
      });

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Itens do pedido inválidos');
  });

  it('cria pedido com ID de produto inválido', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({
        estabelecimento_id: estabelecimentoId,
        itens: [{ produto_id: 'invalid-id', quantidade: 1 }]
      });

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
      .get(`/pedidos/${uuidInexistente}`);

    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Pedido não encontrado');
  });

  it('cria pedido com produto inexistente', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({
        estabelecimento_id: estabelecimentoId,
        itens: [{ produto_id: uuidInexistente, quantidade: 1 }]
      });

    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Produto não encontrado');
  });

  it('cria pedido com estabelecimento inexistente', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({
        estabelecimento_id: uuidInexistente,
        itens: [{ produto_id: produtoId, quantidade: 1 }]
      });

    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Estabelecimento não encontrado');
  });

  // 422 — Regras de negócio
  it('não permite criar pedido com estoque insuficiente', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({
        estabelecimento_id: estabelecimentoId,
        itens: [{ produto_id: produtoId, quantidade: 101 }]
      });

    assert.strictEqual(response.status, 422);
    assert.match(response.body.error, /não tem estoque suficiente/);
  });

  it('não permite criar pedido com produto inativo', async () => {
    // Atualizar o produto para inativo
    await db.query('UPDATE produtos SET ativo = false WHERE id = :produtoId', {
      replacements: { produtoId },
      type: QueryTypes.UPDATE,
    });

    const response = await request(app)
      .post('/pedidos')
      .send({
        estabelecimento_id: estabelecimentoId,
        itens: [{ produto_id: produtoId, quantidade: 1 }]
      });

    assert.strictEqual(response.status, 422);
    assert.strictEqual(response.body.error, 'Produto não está ativo');
  });
});