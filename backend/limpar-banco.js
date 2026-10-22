import 'dotenv/config';
import db from './src/config/db.js';

async function limparBanco() {
  try {
    await db.authenticate();

    await db.query(`
      TRUNCATE TABLE produtos, estabelecimentos
      RESTART IDENTITY CASCADE;
    `);

    console.log('Dados de produtos e estabelecimentos apagados.');
  } catch (erro) {
    console.error('Erro ao limpar o banco:', erro.message);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

limparBanco();