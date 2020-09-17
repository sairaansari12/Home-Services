/* jshint indent: 2 */
const common = require('../../helpers/common');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('services', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: 0
      
  },

    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: ''

    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ""
    },

    icon: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('icon')!="")
        return config.IMAGE_APPEND_URL+"services/icons/"+this.getDataValue('icon')
        else return ""

    },
      defaultValue: ""
    },

    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        if(this.getDataValue('thumbnail')!="")
        return config.IMAGE_APPEND_URL+"services/thumbnails/"+this.getDataValue('thumbnail')
        else return ""
    },
     
      defaultValue: ""
    },




    type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ""
    },

    duration: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: ""
    },


    turnaroundTime: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: ""
    },

    

    price:
    {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 1
    },

    includedServices: {
      type: DataTypes.STRING(),
    //   get() {
    //     return this.getDataValue('includedServices').split(',')
    // },
    
      allowNull: true,
      defaultValue:''
    },


    excludedServices: {
      type: DataTypes.STRING(),
    //   get() {
    //     return this.getDataValue('excludedServices').split(',')
    // },
    
      allowNull: true,
      defaultValue:''
    },




    child_service: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },

    connected_service: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },


    orderby: {
      type: DataTypes.INTEGER(20),
      allowNull: true
    },


    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
    

    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
       },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    
    }
  }, {
    tableName: 'services',
    timestamps: false
  });
};
