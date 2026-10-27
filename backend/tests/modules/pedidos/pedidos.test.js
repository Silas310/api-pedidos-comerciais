import 'dotenv/config';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../../src/app.js';
import db from '../../../src/config/db.js';
import { QueryTypes } from 'sequelize';

// criar pedido
// Teste para criar um pedido
// verifica correção de todos os passos

describe('Pedidos', () => {
  // 1. Limpar/preparar o banco de testes

  // 2. Criar um estabelecimento e obter seu ID

  // 3. Criar um produto com preço e estoque conhecidos
  // Obter seu ID

  // 4. Criar um pedido usando a API

  // 5. Verificar:
  // - Status HTTP 201
  // - Pedido criado com ID
  // - Estabelecimento associado corretamente
  // - Item associado ao pedido e ao produto
  // - Quantidade correta
  // - Total calculado pelo servidor
  // - Estoque reduzido corretamente

  let estabelecimentoId;
  let produtoId;

  beforeEach(async () => {
    await db.query(`
      TRUNCATE TABLE 
      pedidos, itens_pedido, 
      produtos, estabelecimentos 
      RESTART IDENTITY CASCADE;
    `);

    await request(app).post('/estabelecimentos').send({
      nome: 'Restaurante Teste',
      endereco: 'Rua Teste, 123',
      telefone: '123456789',
    });

    estabelecimentoId = (await db.query(`
      SELECT id FROM estabelecimentos WHERE nome = 'Restaurante Teste'  
    `, { type: QueryTypes.SELECT }))[0].id;

    await request(app).post('/produtos').send({
      nome: 'Produto Teste',
      descricao: 'Descrição do Produto Teste',
      preco: 10.00,
      estoque: 10,
    });

    produtoId = (await db.query(`
      SELECT id FROM produtos WHERE nome = 'Produto Teste'  
    `, { type: QueryTypes.SELECT }))[0].id;
  });

  it('Deve criar um pedido com sucesso', async () => {
    const response = await request(app).post('/pedidos').send({
      estabelecimento_id: estabelecimentoId,
      itens: [
        {
          produto_id: produtoId,
          quantidade: 2
        }
      ]
    });

    console.log('Status:', response.status);
    console.log('Resposta:', response.body);

    console.log('Verificando status:');
    assert.strictEqual(response.status, 201);
    console.log('Verificando id:');
    assert.ok(response.body.id);
    assert.strictEqual(response.body.estabelecimento_id, estabelecimentoId);
    assert.strictEqual(response.body.itens.length, 1);
    assert.strictEqual(response.body.itens[0].produto_id, produtoId);
    assert.strictEqual(response.body.itens[0].quantidade, 2);
    assert.strictEqual(Number(response.body.total), 20.00);

    const resultado = await db.query(
      `SELECT estoque FROM produtos WHERE id = $1`,
      {
        bind: [produtoId],
        type: QueryTypes.SELECT
      }
    );

    const novoEstoque = resultado[0].estoque;
    assert.strictEqual(novoEstoque, 8);
  });
});