import Course from "../model/instructorCourse.js";
import Video from "../model/instructorVideo.js";
import Quiz from "../model/instructorQuiz.js";
import Earning from "../model/instructorEarning.js";
import User from "../model/user.js";// Helper: fetch courses, earnings, userData
export async function getInstructorData(req) {
    const instructorId = req.session.user_id;
    if (!instructorId || req.session.role !== "instructor") {
        throw new Error("Not authorized");
    }

    const courses = await Course.find({ instructor: instructorId })
        .populate("videos")
        .populate("quizzes");

    const earnings = await Earning.find({ instructor: instructorId });
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    const userData = await User.findById(instructorId);

    return { courses, totalEarnings, userData };
}

// -------------------- Dashboard --------------------
export const dashboard = async (req, res) => {
    const instructorId = req.session.user_id;
    if (!instructorId || req.session.role !== "instructor") return res.redirect("/login");

    try {
        const { courses, totalEarnings, userData } = await getInstructorData(req);
        res.render("instructorDashboard", { courses, totalEarnings, userData, role: req.session.role });
    } catch (err) {
        console.error(err);
        res.redirect("/login");
    }
};

// -------------------- Create Course Form --------------------
export const createCourseForm = async (req, res) => {
    const instructorId = req.session.user_id;
    if (!instructorId || req.session.role !== "instructor") return res.redirect("/login");

    try {
        const { courses, totalEarnings, userData } = await getInstructorData(req);
        res.render("instructorCreate", { courses, totalEarnings, userData, role: req.session.role });
    } catch (err) {
        console.error(err);
        res.redirect("/login");
    }
};

// -------------------- Create Course --------------------
export const instructorCreate = async (req, res) => {
    const instructorId = req.session.user_id;

    if (!instructorId || req.session.role !== "instructor") {
        return res.redirect("/login");
    }

    try {
        const { title, description, price } = req.body;
        const coverImage = req.file ? req.file.filename : null;

        const newCourse = new Course({
            title,
            description,
            price,
            coverImage,
            instructor: instructorId
        });

        await newCourse.save();
        return res.redirect("/instructorDashboard");

    } catch (err) {
        console.error("Create course error:", err);
        return res.status(500).send("Create course error");
    }
};


// -------------------- Upload Video Form --------------------
// Upload Video Form
export const uploadVideoForm = async (req, res) => {
    try {
        const instructorId = req.session.user_id;
        if (!instructorId || req.session.role !== "instructor") return res.redirect("/login");

        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).send("Course not found");

        if (course.instructor.toString() !== instructorId.toString()) return res.status(401).send("Not authorized");

        const userData = await User.findById(instructorId); // userData fetch

        res.render("instructorUploadVideo", {
            course,
            userData, // mandatory for header
            role: req.session.role
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// Upload Video POST
export const uploadVideo = async (req, res) => {
// console.log("BODY:", req.body);
// console.log("FILE:", req.file);

  try {

    // Check file
    if (!req.file) {
      return res.send("No video selected");
    }

    // Check title
    if (!req.body.title) {
      return res.send("Title is required");
    }

    // 1️⃣ Create video
    const video = new Video({
      title: req.body.title,
      course: req.params.courseId,
      path: req.file.filename
    });

    await video.save();


    // 2️⃣ Push video into course
    await Course.findByIdAndUpdate(
      req.params.courseId,
      { $push: { videos: video._id } }
    );


    // 3️⃣ Redirect
    res.redirect("/instructorDashboard");

  } catch (err) {

    console.error("Upload error:", err);

    res.send("Video upload failed");

  }
};
// -------------------- Add Quiz Form --------------------
export const addQuizForm = async (req, res) => {
    if (!req.session.user_id || req.session.role !== "instructor") {
        return res.redirect("/login");
    }

    try {
        const courseId = req.params.courseId;

        const course = await Course.findById(courseId);
        if (!course) return res.send("Course not found");

        const userData = await User.findById(req.session.user_id);

        res.render("instructorAddquiz", {
            course,
            userData,
            role: req.session.role
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};
// -------------------- Add Quiz --------------------
export const addQuiz = async (req, res) => {
    if (!req.session.user_id || req.session.role !== "instructor") {
        return res.redirect("/login");
    }

    try {
        const { title, questions } = req.body;

        const newQuiz = new Quiz({
            course: req.params.courseId,
            title,
            questions
        });

        await newQuiz.save();

        await Course.findByIdAndUpdate(
            req.params.courseId,
            { $push: { quizzes: newQuiz._id } }
        );

        res.redirect("/instructorDashboard");

    } catch (err) {
        console.error(err);
        res.status(500).send("Add quiz error");
    }
};
// -------------------- Earnings Page --------------------
export const earningsPage= async (req, res) => {
    if (!req.session.user_id || req.session.role !== "instructor") {
        return res.redirect("/login");
    }

    try {
        const { courses, totalEarnings, userData } = await getInstructorData(req);

        res.render("instructorDashboard", {
            courses,
            totalEarnings,
            userData,
            role: req.session.role
        });

    } catch (err) {
        console.error(err);
        res.redirect("/login");
    }
};

// ===============================
// INSTRUCTOR ANALYSIS PAGE
// ===============================
export const analysisPage = async (req, res) => {
  try {
    if (!req.session.user_id || req.session.role !== "instructor") {
      return res.redirect("/login");
    }

    const instructorId = req.session.user_id;

    // 1️⃣ Instructor courses + videos
    const courses = await Course.find({ instructor: instructorId })
      .populate("videos");

    // 2️⃣ Earnings
    const earnings = await Earning.find({ instructor: instructorId });

    const totalEarnings = earnings.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    // 3️⃣ Course-wise analysis data
    const analysisData = courses.map(course => {
      const courseEarnings = earnings
        .filter(e => e.course.toString() === course._id.toString())
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        title: course.title,
        videosCount: course.videos.length,
        earnings: courseEarnings
      };
    });

    const userData = await User.findById(instructorId);

    res.render("instructorAnalysis", {
      analysisData,
      totalCourses: courses.length,
      totalEarnings,
      userData,
      role: req.session.role
    });

  } catch (err) {
    console.log("Analysis page error:", err);
    res.status(500).send("Analysis error");
  }
};
