import 'dotenv/config';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../../src/app.js';
import db from '../../../src/config/db.js';
import { QueryTypes } from 'sequelize';


describe('Erros Estabelecimentos', () => {
  beforeEach(async () => {
    // 1. Limpar o banco de dados antes de cada teste
    await db.query('DELETE FROM itens_pedido', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM pedidos', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM produtos', { type: QueryTypes.DELETE });
    await db.query('DELETE FROM estabelecimentos', { type: QueryTypes.DELETE });
  });

  // 400 — Dados inválidos
  it('cria estabelecimento com dados inválidos', async () => {
    const response = await request(app)
      .post('/estabelecimentos')
      .send({ nome: '', endereco: '', telefone: '' });
    assert.strictEqual(response.status, 400); // precisou altera model
    assert.strictEqual(response.body.error, 'Dados inválidos');
  });

  // 404 — Recursos inexistentes
  it('busca estabelecimento inexistente', async () => {
    const response = await request(app)
      .get('/estabelecimentos/00000000-0000-0000-0000-000000000000');
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Estabelecimento não encontrado');
  });
  it('atualiza estabelecimento inexistente', async () => {
    const response = await request(app)
      .put('/estabelecimentos/00000000-0000-0000-0000-000000000000')
      .send({ nome: 'Estabelecimento Atualizado', endereco: 'Rua Atualizada, 456', telefone: '987654321' });
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Estabelecimento não encontrado');
  });
  it('reatribui estabelecimento inexistente', async () => {
    const response = await request(app)
      .patch('/estabelecimentos/00000000-0000-0000-0000-000000000000')
      .send({ nome: 'Estabelecimento Reatribuído' });
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Estabelecimento não encontrado');
  });
  it('exclui estabelecimento inexistente', async () => {
    const response = await request(app)
      .delete('/estabelecimentos/00000000-0000-0000-0000-000000000000');
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.body.error, 'Estabelecimento não encontrado');
  });

});