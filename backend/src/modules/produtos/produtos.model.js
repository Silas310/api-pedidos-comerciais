import { DataTypes } from 'sequelize'
import db from '../../config/db.js'


const Produto = db.define('Produto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validation: {
      notEmpty: true,
      len: [1, 150]
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      notEmpty: true,
      len: [0, 500] // Limite de 500 caracteres
    }
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  estoque: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: true,
      min: 0
    }
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
  },
  atualizado_em: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'produtos',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
})


export default Produto