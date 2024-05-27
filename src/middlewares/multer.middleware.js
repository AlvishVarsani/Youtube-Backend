//multer is a middlware use for the uploading the file 
//code is copied from npm multer
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
    
      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ 
    storage: storage 
})




//http :this will have abc--->abc
//https :this will have abc--->abc*&$#$%$% encyption
//http header: It is the metadata --->which store in the form of key values and it is send along with the req and res
// http header:uses: authentication,manage state,caching