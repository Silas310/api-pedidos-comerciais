import { DataTypes } from 'sequelize'
import db from '../../config/db.js'
/*
CREATE TABLE estabelecimentos (
	id UUID PRIMARY KEY,
	nome VARCHAR(150) NOT NULL,
	endereco TEXT NOT NULL,
	telefone VARCHAR(20),
	ativo BOOLEAN NOT NULL DEFAULT TRUE,
	criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
*/

const Estabelecimento = db.define('Estabelecimento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  endereco: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  criado_em: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'estabelecimentos',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: false
})