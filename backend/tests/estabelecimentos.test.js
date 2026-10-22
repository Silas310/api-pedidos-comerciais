import 'dotenv/config';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';


describe('Estabelecimentos', () => {
  let estabelecimento;

  const dadosEstabelecimento = {
    nome: 'Estabelecimento Teste',
    endereco: 'Endereço do estabelecimento teste',
    telefone: '21 94002-8922'
  };

  beforeEach(async () => {
    await db.query("TRUNCATE TABLE estabelecimentos RESTART IDENTITY CASCADE");

    const resposta = await request(app).post('/estabelecimentos').send(dadosEstabelecimento);

    estabelecimento = resposta.body;
  })
  it('lista todos os estabelecimentos', async () => {
    const resposta = await request(app).get('/estabelecimentos');

    assert.strictEqual(resposta.status, 200);
    assert.ok(Array.isArray(resposta.body));
    assert.ok(resposta.body.some((item) => item.id === estabelecimento.id));
  });
  it('busca estabelecimento por ID', async () => {
    const resposta = await request(app)
      .get(`/estabelecimentos/${estabelecimento.id}`);
        assert.strictEqual(resposta.status, 200);
    assert.strictEqual(resposta.body.id, estabelecimento.id);
    assert.strictEqual(resposta.body.nome, dadosEstabelecimento.nome);
  });

  it('cria estabelecimento', async () => {
    const novoEstabelecimento = {
      ...dadosEstabelecimento,
      nome: 'Outro Estabelecimento'
    };

    const resposta = await request(app)
      .post('/estabelecimentos')
      .send(novoEstabelecimento);

    assert.strictEqual(resposta.status, 201);
    assert.strictEqual(resposta.body.nome, 'Outro Estabelecimento');
  });

  it('atualiza estabelecimento', async () => {
    const estabelecimentoAtualizado = {
      nome: 'Estabelecimento Atualizado',
      endereco: 'Novo endereço',
      telefone: '21 99999-9999'
    };

    const resposta = await request(app)
      .put(`/estabelecimentos/${estabelecimento.id}`)
      .send(estabelecimentoAtualizado);

    assert.strictEqual(resposta.status, 200);
    assert.strictEqual(resposta.body.nome, 'Estabelecimento Atualizado');
  });

  it('atualiza parcialmente estabelecimento', async () => {
    const resposta = await request(app)
      .patch(`/estabelecimentos/${estabelecimento.id}`)
      .send({ telefone: '21 98888-8888' });

    assert.strictEqual(resposta.status, 200);
    assert.strictEqual(resposta.body.telefone, '21 98888-8888');
    assert.strictEqual(resposta.body.nome, dadosEstabelecimento.nome);
  });

  it('deleta estabelecimento', async () => {
    const resposta = await request(app)
      .delete(`/estabelecimentos/${estabelecimento.id}`);

    assert.strictEqual(resposta.status, 204);

    const busca = await request(app)
      .get(`/estabelecimentos/${estabelecimento.id}`);

    assert.strictEqual(busca.status, 404);
  });
});