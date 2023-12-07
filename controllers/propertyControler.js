const Property = require("../models/property");
const Review = require("../models/review");
const User = require("../models/users");

const propertyControler = {}


propertyControler.getAll = async (req, res) => {
    const allProperties = await Property.find()
    res.render('Properties', { allProperties });
}



propertyControler.get_editProperty = async (req, res) => {
    const property = await Property.findById(req.params.id)
    res.render('EditProperty', { property });

}

propertyControler.deleteById = async (req, res) => {
    const property = await Property.findByIdAndDelete(req.params.id)
    res.redirect('/profile')

}
propertyControler.removeFromWishlist = async (req, res) => {
    const { id } = req.params
    console.log({id})
    const user = await User.findById(req.user._id)
    user.wishList = user.wishList.filter((item) => item.toString() !== id)
    await user.save()
    res.redirect("back")
}






propertyControler.post_filterProperty = async (req, res) => {
    const { rentOrbuy, location, priceRangeFrom, priceRangeTo, type, rating } = req.body;
    console.log(req.body)

    try {
        const query = {};

       
        if (rentOrbuy) {
            query.rentOrbuy = rentOrbuy;
        }
        if (location) {
            query.district = location;
        }

        if (priceRangeFrom && priceRangeTo) {
            query.price = { $gte: parseInt(priceRangeFrom), $lte: parseInt(priceRangeTo) };
        }

        if (type) {
            query.type = {$in: type};
        }

        if (rating && rating !== "0") {
            query.overallRatings =  parseInt(rating);
        }
        console.log({query})
        const filteredProperties = await Property.find(query);

        res.render('Properties', { allProperties: filteredProperties });

    } catch (error) {
        console.error('Error processing filter:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


propertyControler.get_property_by_id =  async (req, res) => {
    try {
        const { id } = req.params
        const property = await Property.findById(id).populate("userId").populate({path : "reviews"})
        const reviews = await Review.find({propertyId : id}).populate({ path : "userId" , select : ["firstName" , "lastName"]})
        console.log({property})
        res.render('propertyDetails', { property , reviews , error : {comment : null , rating : null , error : null} });
    } catch (error) {
        console.log(error)
        res.send('Something Went Wrong !')
    }
}



propertyControler.post_add_property = async (req, res) => {
    const { propertyType, district, numRooms, rentOrbuy, floorNumber, numberOfFloors, price, mainRoad, nearbyAmenities, size, description, latitude
        , longitude,
        city,
        country, } = req.body
    const imgsArray = []


    // if (district === "" || numRooms === "" ||  floorNumber === "" || numberOfFloors === "" || price === "" || mainRoad === "" || nearbyAmenities === ""  ||  size === "" || description === "") {
    //     return res.render('AddProperty', { msg : {district : "District is a required Field !", error : "All fields are required !"  , password : null} , data : req.body });

    //    }
    const fieldsToCheck = {
        district: null,
        numRooms: null,
        rentOrbuy: null,
        floorNumber: null,
        numberOfFloors: null,
        price: null,
        mainRoad: null,
        nearbyAmenities: null,
        size: null,
        description: null
    };

    console.log(req.body)
    const errors = [];
    // Function to add an error for a specific field
    const addError = (field, message) => {
        errors.push({ [field]: message });
    };

    // Check each field individually
    for (const field in fieldsToCheck) {
        if (req.body[field] === "") {
            addError(field, `${field.charAt(0).toUpperCase() + field.slice(1)} is a required field!`);
        }
    }


    console.log({ errors })
    if (errors.length > 0) {
        return res.render('AddProperty', {
            // return res.json({
            msg: {
                error: 'All fields are required!',
                specificErrors : errors
            },
            data: req.body
        });
    }


    req.files.forEach(file => {
        imgsArray.push(file.filename)
    })


    const data = new Property({
        type: propertyType,
        email: req.user.email,
        username: req.user.fullname,
        district,
        mainRoad: mainRoad,
        nearbyAmenties: nearbyAmenities,
        floors: numberOfFloors,
        rooms: numRooms,
        onFloorNumber: floorNumber,
        rentOrbuy,
        size: size,
        latitude,
        longitude,
        city,
        country,
        price: price,
        description: description,
        images: imgsArray,
        location: "String",
        userId: req.user._id,
    })

    const property = await data.save()

    const propertyId = property._id;
    res.redirect(`/property/propertyDetails/${propertyId}`)
}



propertyControler.get_addProperty = (req, res) => {
    const data = {
        district: null, numRooms: null, rentOrbuy: null, floorNumber: null, numberOfFloors: null, price: null, mainRoad: null, nearbyAmenities: null, size: null, description: null
    }
    res.render('AddProperty', { user: req.user, msg: { error: null }, data: data });
}


propertyControler.post_editProperty = async (req, res) => {
    console.log(req.body)
    const { property_id,  rentOrbuy, propertyType, district, numRooms, floorNumber, numberOfFloors, price, mainRoad, nearbyAmenities, size, description } = req.body
    const findProperty = await Property.findById(property_id)

    const imgsArray = [...findProperty.images]

    req.files.forEach(file => {
        imgsArray.push(file.filename)
    })


    findProperty.type = propertyType
    findProperty.district = district
    findProperty.rooms = numRooms
    findProperty.floors = numberOfFloors
    findProperty.rentOrbuy = rentOrbuy
    findProperty.price = price
    findProperty.size = size
    findProperty.description = description
    findProperty.nearbyAmenties = nearbyAmenities
    findProperty.onFloorNumber = floorNumber
    findProperty.mainRoad = mainRoad
    findProperty.images = imgsArray

    await findProperty.save()
    res.redirect(`/property/propertyDetails/${property_id}`)

}


propertyControler.get_addToWishlist = async (req, res) => {
    let id = req.params.id;
    try {
        const user = await User.findById(req.user._id)

        const propertyIndex = user.wishList?.indexOf(id);

        if (propertyIndex !== -1) {
            user.wishList?.splice(propertyIndex, 1);
            await user.save();
            return res.redirect("/property/all")
        }

        user.wishList?.push(id);
        await user.save();
        return res.redirect("/property/all")

    } catch (error) {
        console.log(error)
        res.send('something went wrong !')
    }
}




propertyControler.post_addReview = async (req, res) => {

    const { id } = req.params
    const { comment, rating } = req.body

    try {

        if(!comment || comment == ""){
            const property = await Property.findById(id).populate("userId").populate({path : "reviews"})
            const reviews = await Review.find({propertyId : id}).populate({ path : "userId" , select : ["firstName" , "lastName"]})
            console.log({property})
          return  res.render('propertyDetails', { property , reviews , error : {comment : "comment is required !" , rating : null , error : null}  });
        }
        if(!rating || rating == "0"){
            const property = await Property.findById(id).populate("userId").populate({path : "reviews"})
            const reviews = await Review.find({propertyId : id}).populate({ path : "userId" , select : ["firstName" , "lastName" ] })
            console.log({property})
          return  res.render('propertyDetails', { property , reviews , error : {comment : null , rating : "Rating is Required !"  , error : null}  });
        }

        const checkReview = await Review.findOne({ $and : [{ userId: req.user._id }, { propertyId : id}] })
        if (checkReview) {
            const property = await Property.findById(id).populate("userId").populate({path : "reviews"})
            const reviews = await Review.find({propertyId : id}).populate({ path : "userId" , select : ["firstName" , "lastName"]})
          return  res.render('propertyDetails', { property , reviews , error : {comment : null , rating : null , error : "You Already Had Submited Review !"}  });
        }
        const review = new Review({
            propertyId: id,
            userId: req.user._id,
            comment,
            reviewFor : "PROPERTY",
            ratings: rating
        })

        const saved = await review.save()
        const property = await Property.findById(id).populate('reviews')
        const overallRating = calculateOverallRating(property);
        console.log({overallRating})
        property.reviews.push(saved._id)
        if(overallRating < 1){
            property.overallRatings = rating 
        }else{

            property.overallRatings = overallRating 
        }

        await property.save()
        res.redirect(`/property/propertyDetails/${id}`)

    } catch (error) {
        console.log(error)
        res.send('something went wrong !')

    }
}




function calculateOverallRating(property) {
    if (!property.reviews || property.reviews.length === 0) {
        return 0; // No reviews, return a default value
    }

    const totalRatings = property.reviews.length;
    const sumRatings = property.reviews.reduce((sum, review) => sum + review.ratings, 0);
    const overallRating = sumRatings / totalRatings;

    return overallRating;
}


module.exports = propertyControler