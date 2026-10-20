import 'dotenv/config'
import app from './app.js'
import db from './config/db.js'


const port = process.env.PORT || 3000


async function iniciarServidor() {
  try {
    await db.authenticate()
    console.log('\x1b[32m%s\x1b[0m', '✅ BANCO DE DADOS: Conexão bem-sucedida!')

    app.listen(port, () => {
      console.log('\x1b[36m%s\x1b[0m', `🚀 SERVIDOR: Rodando na porta ${port}`)
    })
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERRO AO CONECTAR AO BANCO:', error)
    process.exit(1)
  }
}


iniciarServidor()