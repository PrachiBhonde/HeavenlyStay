const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings");
const multer  = require('multer')  // Form k data ko parse krne k liye multer ka use hota hai
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage }) // Form me file upload krne k liye (File ko cloudinary ke storage me save krega)



router.route("/")
  .get( wrapAsync(listingController.index))   //index route
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing)
);  //create route

  

//New route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
   .get( wrapAsync(listingController.showListing))  //show route
   .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing)) //update route
   .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing )); //delete route


//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;