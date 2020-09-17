const express = require('express');
const app = express();
const db = require('../../db/db');
const config = require('config');
const Op = require('sequelize').Op;
const moment   = require('moment');


//Relations
SERVICES.belongsTo(CATEGORY,{as: 'category',foreignKey: 'categoryId'})
SERVICES.hasOne(FAVOURITES,{id: 'id'})
SERVICES.hasOne(CART,{serviceId: 'serviceId'})
COMPANY.hasMany(CATEGORY,{foreignKey: 'companyId'})

//Home API with cats and trending and banners

app.get('/getParentcategories', checkAuth,async (req, res, next) => {
    try{

      //Get All Categories
      const servicesData = await CATEGORY.findAll({
        attributes: ['id','name', 'icon','thumbnail','colorCode'],
        where: {
          status: 1,
          parentId :'0',
          id:  {[Op.not]: '0'},
      
               },
              
               
        order: [
          ['orderby','ASC']
        ],
      })

  

      //CART ITEMS CATEGORY
var cartCategoryType="",cartCategoryCompany=""
var cartData = await CART.findAll({where :{ userId : req.id},
include: [
  {model:SERVICES , attributes: ['categoryId']}
]});

for(var p=0;p<cartData.length;p++)
{
if(cartData[p].service && cartData[p].service.categoryId && cartData[p].service.categoryId!="")
{
var data=await CATEGORY.findOne({
  attributes: ['connectedCat','id','companyId'],
  where: {
    id: cartData[p].service.categoryId
  }});

  cartCategoryType=JSON.parse(JSON.stringify(data.dataValues.connectedCat).toString())
  cartCategoryCompany=data.dataValues.companyId

  break;

}

}



console.log(">>>>>>>>>>>>>>>>>",req.parentCompany)
    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name','url'],
      where:{companyId :req.parentCompany},
      order: [
        ['orderby','ASC']
      ], 
    })

   
    let userData = {}
    
    //Combining Data
    userData.banners = banners
    userData.services = servicesData
    userData.cartCategoryType=cartCategoryType
    userData.cartCategoryCompany=cartCategoryCompany

    var currency =await commonMethods.getCurrency(req.companyId) 

    var links =await commonMethods.getLinks(req.parentCompany) 


    var termsLink="",aboutUsLink="",privacyLink=""
    if(links && links.dataValues) 
    { aboutUsLink=links.dataValues.aboutusLink
      privacyLink=links.dataValues.privacyLink
      termsLink=links.dataValues.termsLink

    }
   
      userData.aboutUsLink=aboutUsLink
      userData.privacyLink=privacyLink
      userData.termsLink=termsLink

    

    if(currency && currency.dataValues && currency.dataValues.currency) 
    userData.currency=currency.dataValues.currency
    else userData.currency=CURRENCY
        return responseHelper.post(res, appstrings.success,userData);

   //return responseHelper.post(res, appstrings.success,userData);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      

});

app.get('/getcategories', checkAuth,async (req, res, next) => {
  try{

    var category=req.query
    //Get All Categories
    const servicesData = await CATEGORY.findAll({
      attributes: ['id','name', 'icon','thumbnail','colorCode'],
      where: {
        status: 1,
        level :'1',
        companyId: req.companyId,
        parentId:category,
        id:  {[Op.not]: '0'},
    
             },
            
             
      order: [
        ['orderby','ASC']
      ],
    })

  
//CART ITEMS CATEGORY
var cartCategoryType=""
var cartData = await CART.findAll({where :{companyId: req.companyId, userId : req.id},
include: [
  {model:SERVICES , attributes: ['categoryId']}
]});

for(var p=0;p<cartData.length;p++)
{
if(cartData[p].service && cartData[p].service.categoryId && cartData[p].service.categoryId!="")
{
var data=await CATEGORY.findOne({
  attributes: ['connectedCat','id'],
  where: {
    id: cartData[p].service.categoryId
  }});

  cartCategoryType=JSON.parse(data.dataValues.connectedCat).toString()
  break;

}

}





    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name','url'],
      where:{companyId :req.companyId},
      order: [
        ['orderby','ASC']
      ], 
    })

   
    let userData = {}
    
    //Combining Data
    userData.banners = banners
    userData.services = servicesData
    userData.cartCategoryType=cartCategoryType
    var currency =await commonMethods.getCurrency(req.companyId) 
if(currency && currency.dataValues && currency.dataValues.currency) userData.currency=currency.dataValues.currency
else userData.currency=CURRENCY
    return responseHelper.post(res, appstrings.success,userData);

}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    

});

app.get('/getCompanies', checkAuth,async (req, res, next) => {
  try{
var category=req.query.categoryId
console.log("...............",category)
    //Get All Categories
    var findData = await COMPANY.findAll({
      attributes:['id','companyName','logo1','address1'],
      where: {
        status: 1,
      role :2
      },
      include:[{model: CATEGORY,attributes:['id','parentId'],required:true,where:{connectedCat: {
        [Op.like]: '%'+ category + '%'
      }, parentId :{[Op.not]:'0'}}}],
             
      order: [
        ['createdAt','ASC']
      ],
    })

    
    var cartCompanyId=""

    var cartData = await CART.findOne({where :{ userId : req.id},
    include: [
      {model:SERVICES , attributes: ['categoryId']}
    ]});
    
   if(cartData && cartData.dataValues) 
      cartCompanyId=cartData.dataValues.companyId


      findData=JSON.parse(JSON.stringify(findData))
for(var k=0;k<findData.length;k++)
{
  findData[k].cartCompanyId=cartCompanyId

}
   if(findData.length>0)
   return responseHelper.post(res, appstrings.success,findData);
  
   else    return responseHelper.post(res, appstrings.no_record,null,204);


}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    

});




app.get('/getSubcat/:category', checkAuth,async (req, res, next) => {

  const category=req.params.category
  var include=[]


    try{
      var services = await CATEGORY.findAll({
        attributes: ['id','name','description','icon','thumbnail'],
        where: {
          parentId: category,
          status: 1,
          companyId:req.companyId

        },
        include: include,
        order: [
          ['orderby','ASC']
        ],
      })


      var newDate = moment(new Date()).format("MM/DD/YYYY");
      const coupanData = await COUPAN.findAll({
        attributes: ['id','name','description','icon','thumbnail','code','discount','validupto'],
        where: {
          companyId: req.companyId,
          status :1,
          validupto: {
            [Op.gte]: newDate
          },
          categoryId:  {[Op.or]: ["",category]}
        }
      })


        //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name','url'],
      where:{companyId :req.companyId},
      order: [
        ['orderby','ASC']
      ], 
    })
      let userData = {}
      
      //Combining Data
      userData.offers = coupanData
      userData.subcat = services
      userData.banners = banners

      getTrending(category,function(err,data)
      {

    if(data)       userData.trending = data
    else      userData.trending = []

    return responseHelper.post(res, appstrings.success, userData);

      })
    


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});


app.get('/getServices/:category', checkAuth,async (req, res, next) => {

var categoryId=req.params.category
var catArray=[categoryId]
  var include=[]

 
   include=[ {
      model: CATEGORY,
      as: 'category',
      attributes: ['id','name','icon','thumbnail'],
      required: true
    },
  
    {
      model: FAVOURITES,
      where: {
        'userId':  req.id,

      },
      attributes:['id'],
      required: false,
                },

   {
      model: CART,
       where: {
      'userId':  req.id,
   },
    attributes:['id'],
   required: false,
   }  


  
  ]
  
    try{


      var catDta = await CATEGORY.findAll({
        attributes: ['id','name','description','icon','thumbnail'],
        where: {
          parentId: categoryId,
          status: 1
        },
        order: [
          ['orderby','ASC']
        ],
      })

      for(var p=0;p<catDta.length;p++)
      {
        catArray.push(catDta[p].id)
      }

      var services = await SERVICES.findAll({
        attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','turnaroundTime','includedServices','excludedServices'],
        where: {
          categoryId:  {[Op.or]: catArray},   
                 status: 1
        },
        include: include,
        order: [
          ['orderby','ASC']
        ],
      })

      services=JSON.parse(JSON.stringify(services))
for(var p=0;p<services.length;p++)
{

   if(services[p].cart) services[p].cart=services[p].cart.id
   else services[p].cart=""

   if(services[p].favourite) services[p].favourite=services[p].favourite.id
   else services[p].favourite=''
}

  let dataSend={};
  dataSend.services=services
  dataSend.headers=catDta
 return responseHelper.post(res, appstrings.success, dataSend);
 


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});
 

async function getTrending(CAT,callback)
{
  try{
  
  var countDataq = await SUBORDERS.findAll({
    attributes: ["id","serviceId",[sequelize.fn("COUNT", sequelize.col("serviceId")), "count"]] , 
    group: ['serviceId'],
    order: [[sequelize.literal('count'), 'DESC']],
    offset: 0, limit: 20,  
});

var serviceArray=[]
for(var k=0;k<countDataq.length;k++)
    {
      serviceArray.push(countDataq[k].serviceId)
    }



    var services = await SERVICES.findAll({
      attributes: ['id','name','description','icon','thumbnail','categoryId'],
      where: {
        id:  {[Op.or]: serviceArray},
        status: 1
      },
              include: [ {
              model: CATEGORY,
              as: 'category',
              attributes: ['name','id'],
              required: true,
              
                where: {
                  connectedCat: {
                    [Op.like]: '%'+ CAT + '%'
            
                  },
              },             
             
          
            }],
    })

    if(services)  callback(null, services);
else  callback(appstrings.oops_something, services)

  }

  catch(e)
  {
console.log(e)
    callback(e.message, null);

  }



}



app.get('/detail', checkAuth,async (req, res, next) => {
var id =req.query.serviceId
let responseNull=  commonMethods.checkParameterMissing([id])
 if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    try{
      var services = await SERVICES.findOne({
        attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','turnaroundTime','includedServices','excludedServices'],
        where: {
          id: id,
          status: 1
        },

        include :[{
          model: FAVOURITES,
          where: {
            'userId':  req.id,
    
          },
          attributes:['id'],
          required: false,
                    },
    
       {
          model: CART,
           where: {
          'userId':  req.id,
       },
        attributes:['id'],
       required: false,
       } ,
       {
        model: CATEGORY,
        as: 'category',
        attributes: ['id','name','icon','thumbnail'],
        required: true
      },
      
      
      
      
      ],


        order: [
          ['orderby','ASC']
        ],
      })
      if(services) 
      {

      services=JSON.parse(JSON.stringify(services))
    
       var rating =0
       var dataRating=await commonMethods.getServiceAvgRating(id) 
       if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) rating=dataRating.dataValues.totalRating
       services.rating=rating     
        if(services.cart) services.cart=services.cart.id
        else services.cart=""

        if(services.favourite) services.favourite=services.favourite.id
        else services.favourite=''
        // services['category']=null
      
      


    return responseHelper.post(res, appstrings.success, services);

      }
     else return responseHelper.post(res,appstrings.no_record,null,204);

    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});


module.exports = app;