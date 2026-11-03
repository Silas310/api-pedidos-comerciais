import { DataTypes } from "sequelize";
import db  from "../../config/db.js";

const ItensPedido = db.define("ItensPedido", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  pedido_id: {
    type: DataTypes.UUID,
    references: {
      model: "pedidos",
      key: "id",
    },
    allowNull: false,
  },
  produto_id: {
    type: DataTypes.UUID,
    references: {
      model: "produtos",
      key: "id",
    },
    allowNull: false,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
    }
  },
  preco_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0,
    }
  },
}, {
  tableName: "itens_pedido",
  timestamps: false,
});

export default ItensPedido;