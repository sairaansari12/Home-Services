const express = require('express');
const app = express();
const db = require('../../db/db');
const moment   = require('moment');

const Sequelize       = require('sequelize');
const Op             = require('sequelize').Op;


//////////////////////////////////////////////
///////////////////////// PromoCode Api //////
//////////////////////////////////////////////

SUBORDERS.belongsTo(ORDERS,{foreignKey: 'orderId'})
SUBORDERS.belongsTo(USERS,{foreignKey: 'userId'})

//////////////////////////// Get Promo List API ////////////////
app.get('/myReviews', checkAuth,async (req, res, next) => {
  try{
    const subData = await SUBORDERS.findAll({
      attributes: ['id','rating','review'],
      where: {
        userId: req.id,
        rating:  {[Op.not]: '0'},
      },
      include: [
        {
        model: SERVICES,
        attributes: ['id','name','icon','thumbnail'],
        required: true
        },
       {
          model: ORDERS,
          attributes: ['id','createdAt','serviceDateTime'],
          required: true
        
      
      }],
      order: [['createdAt', 'DESC']]

    })
    
    
if(subData && subData.length>0) return responseHelper.post(res, appstrings.success,subData)
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});


//SERVICE RATING
app.get('/serviceRatings', checkAuth,async (req, res, next) => {

  var params=req.query
  try{
    let responseNull=  commonMethods.checkParameterMissing([params.serviceId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    var page =1
    var limit =100
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit


    var subData = await SUBORDERS.findAll({
      attributes: ['id','rating','review'],
    
      where: {
        serviceId:  params.serviceId,
        rating:  {[Op.not]: '0'}

      },
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: true
        }],
      order: [['createdAt', 'DESC']],
      offset: offset, limit: limit,

    })
    

    const ratData = await SUBORDERS.findOne({
      attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating']],
    where: {
      serviceId:  params.serviceId}
    })
    

let dataToSend={}
if(subData && subData.length>0) 
{
  dataToSend.avgRating=ratData.dataValues.totalRating
  dataToSend.data=subData

  return responseHelper.post(res, appstrings.success,dataToSend)
}
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});




///////// Add Coupan /////////////////////////
app.post('/addRating', checkAuth, async (req, res, next) => {
  try {
    const data = req.body;
    //Get Coupan Details

    let responseNull = commonMethods.checkParameterMissing([data.companyId])
    if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);
    var companyrating,orderrating ;
//to check if its company rating or order rating
    if(data.orderId){
      //order rating
      orderrating = await COMPANYRATING.findOne({ 
        where: { 
          userId: req.id,
          companyId: data.companyId,
          orderId: data.orderId
        } 
      })
    } else{
      // company rating
      companyrating = await COMPANYRATING.findOne(
        { where: { 
          userId: req.id,
          companyId: data.companyId,
          [Op.or]:[{
            orderId: ""
          },{
            orderId: null
          }
        ]
         } 
      })

    }

    var upload = []
    if (req.files && req.files['images']) {
      var fdata = req.files['images']
      if (fdata.length && fdata.length > 0) {

        for (var k = 0; k < fdata.length; k++) {

          ImageFile = req.files['images'][k];
          bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
          upload.push(bannerImage)
          ImageFile.mv(config.UPLOAD_DIRECTORY + "reviews/" + bannerImage, function (err) {
            //upload file
            if (err)
              return responseHelper.error(res, err.meessage, 400);
          });
        }

      }

      else {
        ImageFile = req.files['images'];
        bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
        upload.push(bannerImage)
        ImageFile.mv(config.UPLOAD_DIRECTORY + "reviews/" + bannerImage, function (err) {
          //upload file
          if (err)
            return responseHelper.error(res, err.meessage, 400);
        });

      }

    }
    if (!data.orderId) {
        if(companyrating){
          if (upload.length == 0 && companyrating.dataValues.reviewImages) {
            upload = companyrating.dataValues.reviewImages
          }
          await COMPANYRATING.update({
            rating: data.rating,
            foodQuality: data.foodQuality,
            foodQuantity: data.foodQuantity,
            packingPres: data.packingPres,
            review: data.review,
            reviewImages: upload.toString(),
          }, { where: { id: companyrating.dataValues.id, companyId: data.companyId,[Op.or]:[{ orderId: ""},{
            orderId: null}] } });
        } else{
          await COMPANYRATING.create({
            rating: data.rating,
            foodQuality: data.foodQuality,
            foodQuantity: data.foodQuantity,
            packingPres: data.packingPres,
            review: data.review,
            userId: req.id,
            orderId: data.orderId,
            reviewImages: upload.toString(),
            companyId: data.companyId
          });
        } 
    }  else {
      if(orderrating){
        if (upload.length == 0 && orderrating.dataValues.reviewImages) {
          upload = orderrating.dataValues.reviewImages
  
        }
        await COMPANYRATING.update({
          rating: data.rating,
          foodQuality: data.foodQuality,
          foodQuantity: data.foodQuantity,
          packingPres: data.packingPres,
          review: data.review,
          reviewImages: upload.toString(),
        }, { where: { id: orderrating.dataValues.id, companyId: data.companyId, orderId: data.orderId } });
      } else{
        await COMPANYRATING.create({
          rating: data.rating,
          foodQuality: data.foodQuality,
          foodQuantity: data.foodQuantity,
          packingPres: data.packingPres,
          review: data.review,
          userId: req.id,
          orderId: data.orderId,
          reviewImages: upload.toString(),
          companyId: data.companyId
        });
      } 
    }    


    //ADD SERVICE RATIUNGS

    if (data.ratingData && data.ratingData.length > 0) {
      var datatoUpdated = []
      if (typeof data.ratingData == "string")
        datatoUpdated = JSON.parse(data.ratingData)
      else
        datatoUpdated = JSON.parse(JSON.stringify(data.ratingData))

      for (var h = 0; h < datatoUpdated.length; h++) {

        SERVICERATINGS.create({
          rating: datatoUpdated[h].rating,
          review: datatoUpdated[h].review,
          serviceId: datatoUpdated[h].serviceId,
          userId: req.id,
          orderId: data.orderId

        });

      }

    }

    return responseHelper.post(res, appstrings.rating_added, null);
  }


  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});
///////// Add Coupan /////////////////////////
app.post('/addCompanyRating', checkAuth,async (req, res, next) => {
  try{
    const data    = req.body;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.companyId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  


  var findData=await COMPANYRATING.findOne({
    userId: req.id,
    companyId:data.companyId});

    if(findData)
    {
      return responseHelper.post(res, appstrings.already_exists,null,400);

    }
    else{
    
      await COMPANYRATING.create({
        rating: data.rating,
        review: data.review,
        userId:req.id,
        companyId:data.companyId
      });

      return responseHelper.post(res, appstrings.rating_added,null);
    }
    
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});




module.exports = app;