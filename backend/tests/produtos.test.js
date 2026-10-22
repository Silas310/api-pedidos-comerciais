import 'dotenv/config';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';


describe('Produtos', () => {
  let produto;

  const dadosProduto = {
    nome: 'Produto Teste',
    descricao: 'Descrição do produto teste',
    preco: 10.99,
    estoque: 10
  };

  beforeEach(async () => {
    await db.query("TRUNCATE TABLE produtos RESTART IDENTITY CASCADE");

    const resposta = await request(app).post("/produtos").send(dadosProduto);

    produto = resposta.body;
  });

  it('lista todos os produtos', async () => {
    const resposta = await request(app).get('/produtos');

    assert.strictEqual(resposta.status, 200);
    assert.ok(Array.isArray(resposta.body));
    assert.ok(resposta.body.some((item) => item.id === produto.id));
  });

  it('busca produto por ID', async () => {
    const resposta = await request(app)
      .get(`/produtos/${produto.id}`);

    assert.strictEqual(resposta.status, 200);
    assert.strictEqual(resposta.body.id, produto.id);
    assert.strictEqual(resposta.body.nome, dadosProduto.nome);
  });

  it('cria produto', async () => {
    const novoProduto = {
      ...dadosProduto,
      nome: 'Outro Produto'
    };

    const resposta = await request(app)
      .post('/produtos')
      .send(novoProduto);

    assert.strictEqual(resposta.status, 201);
    assert.strictEqual(resposta.body.nome, 'Outro Produto');
  });

  it('atualiza produto', async () => {
    const produtoAtualizado = {
      nome: 'Produto Atualizado',
      descricao: 'Descrição atualizada',
      preco: 12.99,
      estoque: 20
    };

    const resposta = await request(app)
      .put(`/produtos/${produto.id}`)
      .send(produtoAtualizado);

    assert.strictEqual(resposta.status, 200);
    assert.strictEqual(resposta.body.nome, 'Produto Atualizado');
  });

  it('atualiza parcialmente produto', async () => {
    const resposta = await request(app)
      .patch(`/produtos/${produto.id}`)
      .send({ preco: 15.99 });

    assert.strictEqual(resposta.status, 200);
    assert.strictEqual(Number(resposta.body.preco), 15.99);
    assert.strictEqual(resposta.body.nome, dadosProduto.nome);
  });

  it('deleta produto', async () => {
    const resposta = await request(app)
      .delete(`/produtos/${produto.id}`);

    assert.strictEqual(resposta.status, 200);

    const busca = await request(app)
      .get(`/produtos/${produto.id}`);

    assert.strictEqual(busca.status, 404);
  });
});
