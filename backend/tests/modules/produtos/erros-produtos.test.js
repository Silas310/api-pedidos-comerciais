import 'dotenv/config';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../../src/app.js';
import db from '../../../src/config/db.js';
import { QueryTypes } from 'sequelize';


describe('Erros Produtos', () => {
  beforeEach(async () => {
    // 1. Limpar o banco de dados antes de cada teste
    await db.query('DELETE FROM itens_pedido', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM pedidos', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM produtos', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM estabelecimentos', { type: QueryTypes.DELETE });
  })

  // 400 — Dados inválidos
  it('cria produto com dados inválidos', async () => {
    const response = await request(app)
      .post('/produtos')
      .send({ nome: '', preco: -10, estoque: -5 });
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Dados inválidos');
  });

  // 404 — Recursos inexistentes
  it('busca produto inexistente', async () => {
    const response = await request(app)
      .get('/produtos/00000000-0000-0000-0000-000000000000');
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Produto não encontrado');
  });
  it('atualiza produto inexistente', async () => {
    const response = await request(app)
      .put('/produtos/00000000-0000-0000-0000-000000000000')
      .send({ nome: 'Produto Atualizado', preco: 20, estoque: 50 });
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Produto não encontrado');
  });
  it('reatribuindo produto inexistente', async () => {
    const response = await request(app)
      .patch('/produtos/00000000-0000-0000-0000-000000000000')
      .send({ nome: 'Produto Reatribuído' });
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Produto não encontrado');
  });
  it('exclui produto inexistente', async () => {
    const response = await request(app)
      .delete('/produtos/00000000-0000-0000-0000-000000000000'); // id formato uuid
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Produto não encontrado');
  });
});