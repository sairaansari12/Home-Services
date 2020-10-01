'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../config/db.js')[env];
const db = {};

let sequelize;
let models = {};

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

let modules = [
  require('./companies.js'),
  require('./employee.js'), 
  require('./users.js'),
  require('./address'),  
  require('./services'), 
  require('./banners'), 
  require('./orders'), 
  require('./suborders'), 
  require('./assignedEmployees'), 
  require('./payment'), 
  require('./cart'), 
  require('./schedule'), 
  require('./favourites'), 
  require('./coupan'), 
  require('./categories'), 
  require('./document'), 
  require('./faq'), 
  require('./faqCategory'), 
  require('./notifications'), 
  require('./contactus'), 
  require('./cancelReason'), 
  require('./companyRatings'), 
  require('./userType'), 
  require('./roleTypes'), 
  require('./businessType'), 
  require('./orderStatus'), 
  require('./chat/groups.js'),
  require('./chat/groupMembers.js'),
  require('./chat/chatMessages.js'),
  require('./chat/textMessages.js'),
  require('./chat/mediaMessages.js'),



];

// Initialize models
modules.forEach((module) => {
  const model = module(sequelize, Sequelize, config);
  model.sync(true);
 // model.sync(true);
  models[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = models;
