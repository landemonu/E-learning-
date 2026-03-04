import Course from "../model/instructorCourse.js";

export async function home(req,res){
    const courses = [
        { name: "HTML Basics", desc: "Learn HTML from zero.", img: "/course/html.jpg" },
        { name: "JavaScript Mastery", desc: "Deep dive into JS.", img: "/course/js.jpg" },
        { name: "Node.js Bootcamp", desc: "Become backend developer.", img: "/course/nodejs.png" }
    ];

    res.render("home", {
        title: "E-Learning Home",
        courses
    });
};

export const index = async (req, res) => {
  try {
    const courses = await Course.find().limit(6); // home page courses

    res.render("index", {
      courses
    });
  } catch (err) {
    console.log(err);
    res.send("Home page error");
  }
};

