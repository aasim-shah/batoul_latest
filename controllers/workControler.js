
const InteriorDesign = require("../models/interiorDesign");
const Review = require("../models/review");
const User = require("../models/users");
const workControler = {}



workControler.getAll =  async (req, res) => {
    const designWorks = await InteriorDesign.find()
    res.render('InteriorDesigners', { designWorks });
  };
  


workControler.post_filterWork = async (req, res) => {
    const { experience, rating } = req.body;
    console.log(req.body)
    try {
      const query = {};
  
  
      if (experience) {
        query.yearsOfExperience =  parseInt(experience, 10);
      }
      if (experience > 5) {
        query.yearsOfExperience = {$gte : parseInt(experience, 10)};
      }

      if (rating && rating !== "0") {
        query.rating =  parseInt(rating, 10);
      }
  
      console.log({query})
      const filteredDesigners = await InteriorDesign.find(query);
  
      res.render('InteriorDesigners', { designWorks: filteredDesigners });
  
    } catch (error) {
      // Handle any errors
      console.error('Error processing filter:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }


workControler.post_addWork = async (req, res) => {
    const { yearsOfExperience, description } = req.body
  
  
  console.log(req.body)

  if(!yearsOfExperience || yearsOfExperience == ""){
  return  res.render('AddWork' , { error : {yearsOfExperience : "Year of Experience is required !" , description : null , files : null }});
  }
  if(!description || description == ""){
   return res.render('AddWork' , { error : {yearsOfExperience : null , description : "Description is required !" , files : null }});
  }

  if(!req.files || req.files.length < 1){
    return res.render('AddWork' , { error : {yearsOfExperience : null , description : null  , files : "files are required !"}});

  }

  console.log(req.files)

    const imgsArray = []
  
    req.files.forEach(file => {
      imgsArray.push(file.filename)
    })
  
  
    const data = new InteriorDesign({
      description: description,
      yearsOfExperience: yearsOfExperience,
      workImages: imgsArray,
      userId: req.user._id,
    })
  
    const work = await data.save()
    const workID = work._id;
    res.redirect(`/interiorDesign/designDetails/${workID}`)
  }




workControler.getDetails_by_id = async (req, res) => {
    try {
      const { id } = req.params
      const designWork = await InteriorDesign.findById(id).populate("userId")
      const reviews = await Review.find({designId : id}).populate({ path : "userId" , select : ["firstName" , "lastName"]})

      res.render('designDetails', { designWork ,reviews  , error : {comment : null , rating : null , error :null} });
    } catch (error) {
      res.send('Something Went Wrong !')
    }
  }


  workControler.removeFromWishlist = async (req, res) => {
    const { id } = req.params
    console.log({id})
    const user = await User.findById(req.user._id)
    user.wishList_interiorDesigns = user.wishList_interiorDesigns.filter((item) => item.toString() !== id)
    await user.save()
    res.redirect("back")
}

workControler.editwork = async (req, res) => {
    try {
      const { id } = req.params
      const designWork = await InteriorDesign.findById(id).populate("userId")
      console.log({designWork})
      res.render('editWork', { designWork  , error : {yearsOfExperience : null , description : null , files : null  } });
    } catch (error) {
      res.send('Something Went Wrong !')
    }
  }


  workControler.deleteById = async (req, res) => {
    const property = await InteriorDesign.findByIdAndDelete(req.params.id)
    res.redirect('/profile')

}




 workControler.get_add_to_wishlist = async (req, res) => {
    let id = req.params.id;
    try {
        const user = await User.findById(req.user._id)

        const interiorDesignIndex = user.wishList_interiorDesigns?.indexOf(id);

        if (interiorDesignIndex !== -1) {
            user.wishList_interiorDesigns?.splice(interiorDesignIndex, 1);
            await user.save();
            return res.redirect("/interiorDesign")
        }

        user.wishList_interiorDesigns?.push(id);
        await user.save();
        return res.redirect("/interiorDesign")

    } catch (error) {
        console.log(error)
        res.send('something went wrong !')
    }
} 





workControler.post_addReview = async (req, res) => {

  const { id } = req.params
  const { comment, rating } = req.body

if(!comment || comment == ""){
  const designWork = await InteriorDesign.findById(id).populate("userId")
  const reviews = await Review.find({designId : id}).populate({ path : "userId" , select : ["firstName" , "lastName"]})
 return  res.render('designDetails', { designWork ,reviews  , error : {comment : "Please Write a comment !" , rating : null , error :null}  });
}


if(!rating || rating == "0"){
  const designWork = await InteriorDesign.findById(id).populate("userId")
  const reviews = await Review.find({designId : id}).populate({ path : "userId" , select : ["firstName" , "lastName"]})
 return  res.render('designDetails', { designWork ,reviews  , error : {comment : null , rating : "Rating is requried !" , error :null} });
}




  try {

      const checkReview = await Review.findOne({$and : [{designId : id} , { userId: req.user._id }]})
      if (checkReview) {
        const designWork = await InteriorDesign.findById(id).populate("userId")
        const reviews = await Review.find({designId : id}).populate({ path : "userId" , select : ["firstName" , "lastName"]})
  
    return      res.render('designDetails', { designWork ,reviews  , error : {comment : null , rating : null , error : "You Already had submitted review !"}  });
      }
      const review = new Review({
          designId: id,
          userId: req.user._id,
          comment,
          reviewFor : "DESIGN",
          ratings: rating
      })

      const saved = await review.save()
      const design = await InteriorDesign.findById(id).populate('reviews')
      const overallRating = calculateOverallRating(design);
      design.reviews.push(saved._id)
      if(overallRating < 1){
        design.rating = rating 
      }else{

        design.rating = overallRating 
      }
      await design.save()

      res.redirect(`/interiorDesign/designDetails/${id}`)

  } catch (error) {
      console.log(error)
      res.send('something went wrong !')

  }
}


function calculateOverallRating(work) {
  if (!work.reviews || work.reviews.length === 0) {
      return 0; // No reviews, return a default value
  }

  const totalRatings = work.reviews.length;
  const sumRatings = work.reviews.reduce((sum, review) => sum + review.ratings, 0);
  const overallRating = sumRatings / totalRatings;

  return overallRating;
}

module.exports =  workControler
