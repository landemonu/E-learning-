import multer from "multer"

const storage=multer.diskStorage({
  destination:(req,file,cb)=>{ return cb(null,'./uploads/videos'); },  
  filename:(req,file,cb)=>{ return cb(null,`${Date.now()}-${file.originalname}`); },
});

const upload=multer({storage});

export {upload};