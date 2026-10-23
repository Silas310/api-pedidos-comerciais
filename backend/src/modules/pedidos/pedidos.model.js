import { DataTypes } from 'sequelize';
import db from '../../config/db.js';


const Pedido = db.define('Pedido', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  estabelecimento_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'estabelecimentos',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pendente'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  criado_em: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pedidos',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: false
});


export default Pedido;