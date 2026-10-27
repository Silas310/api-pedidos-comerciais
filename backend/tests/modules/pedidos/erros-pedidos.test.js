import 'dotenv/config';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../../src/app.js';
import db from '../../../src/config/db.js';
import { QueryTypes } from 'sequelize';

// testes negativos para criação de pedidos
/* 
Estoque insuficiente, produto não encontrado, 
estabelecimento não encontrado.
*/

describe('Erros Pedidos', () => {
  let produtoId;
  let estabelecimentoId;

  beforeEach( async () => {
    await db.query(`
      TRUNCATE TABLE estabelecimentos, produtos, pedidos
      RESTART IDENTITY CASCADE;
    `, { type: QueryTypes.RAW });

    const produto = {
      nome: 'Produto Teste',
      descricao: 'Descrição do produto teste',
      preco: 10.99,
      estoque: 0 // estoque insuficiente
    };

    await request(app).post("/produtos").send(produto);

    produtoId = (await db.query(`
      SELECT id FROM produtos WHERE nome = $1
      `, {
        bind: [produto.nome],
        type: QueryTypes.SELECT
      }))[0].id;

    const estabelecimento = {
      nome: 'Estabelecimento Teste',
      endereco: 'Endereço do estabelecimento teste'
    };

    await request(app).post("/estabelecimentos").send(estabelecimento);

    estabelecimentoId = (await db.query(`
      SELECT id FROM estabelecimentos WHERE nome = $1
    `, {
      bind: [estabelecimento.nome],
      type: QueryTypes.SELECT
    }))[0].id;
  });

  it('não permite criar pedido com estoque insuficiente', async () => {
    console.log('Estabelecimento ID: ', estabelecimentoId);
    console.log('Produto ID: ', produtoId);
    // produto deve ter estoque 0, então não é sera criaado pedido
    const pedidoData = {
      estabelecimento_id: estabelecimentoId,
      itens : [
        {
          produto_id: produtoId,
          quantidade: 1
        }
      ]
    }

    const response = await request(app).post("/pedidos").send(pedidoData);
    console.log('Status: ', response.status);
    console.log('Body: ', response.body);

    assert.equal(
      response.body.error, 
      `Produto com ID ${produtoId} não tem estoque suficiente`
    );
  });
})