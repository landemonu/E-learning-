import Course from "../model/instructorCourse.js"
import userHandler from "../model/user.js";

export async function reg(req,res) {
    await res.render("reg",{userData:""});
}

export async function regSubmit(req,res) {    
    const {name,email,mobile,password,confirm_Password,role,address} = req.body;
    const profile = req.file.filename;
    await userHandler({name,email,mobile,password,confirm_Password,role,address,profile}).save()
    .then(()=>{ res.redirect("/login") })
}

export async function login(req,res){    
    if(req.session.username){
        return res.redirect("/home",{err:"",userData:""});
    }
    else{        
        await res.render("login",{err:"",userData:""});
    }    
}

export async function loginSubmit(req, res) {
  const { email, password } = req.body;

  try {
    const userData = await userHandler.findOne({ email });

    if (!userData) {
      return res.render("login", { err: "User not found", userData: "" });
    }

    if (password !== userData.password) {
      return res.render("login", { err: "Invalid password", userData: "" });
    }

    req.session.user_id = userData._id;
    req.session.role = userData.role;

    if (userData.role === "student") {
      return res.redirect("/studentDashboard");
    } else if (userData.role === "instructor") {
      return res.redirect("/instructorDashboard");
    } else if (userData.role === "admin") {
      return res.redirect("/adminDashboard");
    } else {
      return res.render("login", { err: "Role not defined", userData: "" });
    }

  } catch (err) {
    console.log(err);
    return res.render("login", { err: "Something went wrong", userData: "" });
  }
}


export async function logout(req,res) {
    req.session.destroy();
    res.redirect("/home");
}

/* ================= PROFILE ================= */

// GET profile page
export const getProfile = async (req, res) => {
  try {
    if (!req.session.user_id) {
      return res.redirect("/login");
    }

    const userData = await userHandler.findById(req.session.user_id);
    res.render("profile", { userData });

  } catch (err) {
    console.log(err);
    res.send("Profile page error");
  }
};

// POST update profile
export const updateProfile = async (req, res) => {
  try {
    if (!req.session.user_id) {
      return res.redirect("/login");
    }

    const { name, mobile, address } = req.body;

    const user = await userHandler.findById(req.session.user_id);
    if (!user) {
      return res.redirect("/login");
    }

    // update fields
    user.name = name;
    user.mobile = mobile;
    user.address = address;

    // profile photo
    if (req.file) {
      user.profile = "uploads/" + req.file.filename;
    }

    await user.save();

    // ✅ ROLE BASED REDIRECT
    if (user.role === "student") {
      return res.redirect("/studentDashboard");
    } 
    else if (user.role === "instructor") {
      return res.redirect("/instructorDashboard");
    } 
    else if (user.role === "admin") {
      return res.redirect("/adminDashboard");
    } 
    else {
      return res.redirect("/profile");
    }

  } catch (err) {
    console.log(err);
    res.send("Error updating profile");
  }
};


export const coursesPage = async (req, res) => {
  const courses = await Course.find();
  res.render("courses", { courses });
};



