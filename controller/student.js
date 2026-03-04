import Razorpay from "razorpay";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Video from "../model/instructorVideo.js";
import userHandler from "../model/user.js";
import Course from "../model/instructorCourse.js";
import Earning from "../model/instructorEarning.js";
import Order from "../model/order.js";
import Quiz from "../model/instructorQuiz.js";

/* ===============================
   RAZORPAY
================================ */

const razorpay = new Razorpay({
  key_id: "rzp_test_S1NqItP5Retw4e",
  key_secret: "tAq6hbWvflkQHYgTehlfU01X"
});


/* ===============================
   HELPER
================================ */

async function getStudent(req) {

  if (!req.session.user_id || req.session.role !== "student") {
    return null;
  }
  return await userHandler.findById(req.session.user_id);
}
/* ===============================
   DASHBOARD
================================ */

export const dashboard = async (req, res) => {

  try {

    const userData = await getStudent(req);
    if (!userData) return res.redirect("/login");

    const courses = await Course.find().populate("instructor");

    res.render("studentDashboard", {
      courses,
      userData,
      role: req.session.role
    });

  } catch (err) {

    console.log("Dashboard error:", err);

  }

};
/* ===============================
   MY COURSES
================================ */

export const myCourses = async (req, res) => {

  try {

    const userData = await getStudent(req);
    if (!userData) return res.redirect("/login");

    // Remove broken references
    userData.courses = userData.courses.filter(c => c.course);
    await userData.save();

    const courseIds = userData.courses.map(c => c.course);

    const enrolledCourses = await Course.find({
      _id: { $in: courseIds }
    }).populate("instructor");

    res.render("studentMycourses", {
      userData,
      enrolledCourses,
      role: req.session.role
    });

  } catch (err) {

    console.log("MyCourses error:", err);

  }

};


/* ===============================
   COURSE DETAILS
================================ */

export const courseDetails = async (req, res) => {

  try {

    const userData = await getStudent(req);
    if (!userData) return res.redirect("/login");

    const course = await Course.findById(req.params.id)
      .populate("instructor");

    if (!course) return res.send("Course not found");

    res.render("studentCourseDetails", {
      course,
      userData,
      role: req.session.role
    });

  } catch {

    res.send("Course details error");

  }

};

/* ===============================
   UPDATE PROGRESS
================================ */

export const updateProgress = async (req, res) => {
  try {

    if (!req.session.user_id) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const userId = req.session.user_id;
    const courseId = req.params.courseId;

    const user = await userHandler.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const courseIndex = user.courses.findIndex(
      c => c.course.toString() === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not enrolled" });
    }

    // ✅ MARK COMPLETED
    user.courses[courseIndex].progress = 100;
    user.courses[courseIndex].completed = true;

    await user.save();

    console.log("Progress updated:", userId, courseId);

    res.json({ success: true });

  } catch (err) {

    console.error("Update progress error:", err);
    res.status(500).json({ error: "Server error" });

  }
};
/* ===============================
   SHOW QUIZ LIST
================================ */
export const quiz = async (req, res) => {
  try {

    // 1. Login check
    if (!req.session.user_id) {
      return res.redirect("/login");
    }

    const userId = req.session.user_id;
    const courseId = req.params.courseId;

    // 2. Get user
    const user = await userHandler.findById(userId);

    if (!user) {
      return res.redirect("/login");
    }

    // 3. Check quiz exists for this course
    const quizzes = await Quiz.find({ course: courseId });

    if (quizzes.length === 0) {
      return res.render("studentQuiz", {
        quizzes: [],
        activeQuiz: null,
        message: "No quiz found for this course"
      });
    }

    // 4. Auto add course to user if not present
    const alreadyEnrolled = user.courses.find(
      c => c.course.toString() === courseId
    );

    if (!alreadyEnrolled) {

      user.courses.push({
        course: courseId,
        courseCompleted: true,   // auto complete
        quizPassed: false,
        certificateIssued: false
      });

      await user.save();
    }

    // 5. Show quiz
    res.render("studentQuiz", {
      quizzes,
      activeQuiz: null,
      message: null
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
/* ===============================
   START QUIZ
================================ */
export const startQuiz = async (req, res) => {

  try {

    if (!req.session.user_id) {
      return res.redirect("/login");
    }

    const quiz = await Quiz.findById(req.body.quizId);

    if (!quiz) {
      return res.redirect("/studentDashboard");
    }

    res.render("studentQuiz", {
      quizzes: [],
      activeQuiz: quiz,
      userData: await getStudent(req),
      role: req.session.role,
      message: null
    });

  } catch (err) {

    console.log("Start quiz error:", err);
    res.redirect("/studentDashboard");

  }
};
/* ===============================
   SUBMIT QUIZ
================================ */
export const submitQuiz = async (req, res) => {
  try {

    const userId = req.session.user_id;

    if (!userId) {
      return res.redirect("/login");
    }

    const { quizId, answers } = req.body;

    console.log("BODY:", req.body);

    // Get quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.send("Quiz not found");
    }

    console.log("QUESTIONS FROM DB:", quiz.questions);

    let score = 0;

    quiz.questions.forEach((q, i) => {

      const userAnswer = Number(answers[i]);      // '0' -> 0
      const correctAnswer = Number(q.correctIndex); // 🔥 VERY IMPORTANT

      console.log(
        `Q${i + 1} => User: ${userAnswer} | Correct: ${correctAnswer}`
      );

      if (userAnswer === correctAnswer) {
        score++;
      }

    });

    const total = quiz.questions.length;

    // console.log("FINAL SCORE:", score, "/", total);

    const courseId = quiz.course;

    // PASS
    if (score >= Math.ceil(total * 0.5)) {

      await userHandler.updateOne(
        {
          _id: userId,
          "courses.course": courseId
        },
        {
          $set: {
            "courses.$.quizPassed": true,
            "courses.$.certificateIssued": true,
            "courses.$.score": score,
            "courses.$.total": total
          }
        }
      );

      return res.redirect(`/studentCertificate/${courseId}`);
    }

    // FAIL
    return res.render("studentQuiz", {
      quizzes: [],
      activeQuiz: quiz,
      failed: true,
      score,
      total,
      quizId
    });

  } catch (err) {
    console.log("Submit Quiz Error:", err);
    res.status(500).send("Server Error");
  }
};
/* ===============================
   VIEW COURSE
================================ */
export const viewCourse = async (req, res) => {

  try {

    const user = await userHandler.findById(req.session.user_id);

    if (!user) return res.redirect("/login");


    const hasCourse = user.courses.some(
      c => c.course.toString() === req.params.courseId
    );

    if (!hasCourse) {
      return res.send("You have not purchased this course");
    }


    const course = await Course.findById(req.params.courseId)
      .populate("videos")
      .populate("quizzes");


    res.render("studentViewCourse", {
      course,
      userData: user,
      role: req.session.role
    });
  } catch {
    res.redirect("/studentDashboard");
  }
};
/* ==============================
   CHECKOUT
================================ */

export const checkoutPage = async (req, res) => {

  if (!req.session.user_id) return res.redirect("/login");

  const course = await Course.findById(req.params.courseId);

  if (!course) return res.send("Course not found");
  res.render("checkout", {
    course,
    key_id: razorpay.key_id
  });

};
/* ===============================
   CREATE ORDER
================================ */

export const createOrder = async (req, res) => {

  try {

    const course = await Course.findById(req.body.courseId);

    if (!course) return res.json({ success: false });


    const order = await razorpay.orders.create({
      amount: course.price * 100,
      currency: "INR",
      receipt: `course_${Date.now()}`
    });


    await Order.create({
      orderId: order.id,
      userId: req.session.user_id,
      courseId: req.body.courseId,
      amount: course.price,
      status: "PENDING"
    });


    res.json({ success: true, order });

  } catch {

    res.json({ success: false });

  }

};
/* ===============================
   PAYMENT SUCCESS
================================ */
export const paymentSuccess = async (req, res) => {

  try {

    const order = await Order.findOne({
      orderId: req.body.razorpay_order_id
    });

    if (!order) return res.json({ success: false });
    order.status = "SUCCESS";
    order.paymentId = req.body.razorpay_payment_id;

    await order.save();
    const user = await userHandler.findById(order.userId);

    if (!user) return res.json({ success: false });
    if (!user.courses.some(c => c.course.toString() === order.courseId)) {

      user.courses.push({
        course: order.courseId,
        progress: 0,
        completed: false,
        quizPassed: false,
        certificateIssued: false
      });

      await user.save();

    }
    const course = await Course.findById(order.courseId);

    if (course?.instructor) {

      await Earning.create({
        instructor: course.instructor,
        course: course._id,
        amount: order.amount
      });

    }
    res.json({ success: true });

  } catch (err) {
    console.log("Payment error:", err);
    res.json({ success: false });
  }
};
/* ===============================
   EDIT PROFILE
================================ */

export const editProfile = async (req, res) => {

  const user = await userHandler.findById(req.session.user_id);

  if (!user) return res.redirect("/login");
  res.render("studentEditprofile", {
    userData: user,
    role: req.session.role
  });

};
/* ===============================
   WATCH VIDEO
================================ */
export const watchVideo = async (req, res) => {
  try {

    const video = await Video.findById(req.params.videoId)
      .populate("course");

    if (!video) {
      return res.send("Video not found");
    }

    // create correct url
    const videoPath = "/" + video.path.replace(/^\/+/, "");
    res.render("studentVideoplayer", {course: video.course,videoUrl: video.path,role: req.session.role});
  } catch (err) {

    console.log("WatchVideo error:", err);
    res.redirect("/studentDashboard");

  }
};
/* ===============================
   CERTIFICATE PAGE
================================ */

export const certificatePage = async (req, res) => {
  try {

    const user = await userHandler
      .findById(req.session.user_id)
      .populate("courses.course");

    if (!user) return res.redirect("/login");

    // Get only passed courses
    const certificates = user.courses.filter(
      c => c.course && c.quizPassed === true
    );
    res.render("studentCertificate", {certificates,
      userData: user,
      role: req.session.role
    });

  } catch (err) {
    console.log("Certificate Page Error:", err);
    res.redirect("/studentDashboard");
  }
};
/* ===============================
   GENERATE CERTIFICATE
================================ */
export const generateCertificate = async (req, res) => {
  try {

    const user = await userHandler
      .findById(req.session.user_id)
      .populate("courses.course");

    if (!user) return res.redirect("/login");

    const courseId = req.params.courseId;

    const courseData = user.courses.find(
      c =>
        c.course &&
        c.course._id.toString() === courseId &&
        c.quizPassed === true
    );

    if (!courseData) {
      return res.send("Certificate not unlocked yet");
    }

    const certDir = path.join("public", "certificates");

    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    const fileName = `${user._id}_${courseId}.pdf`;
    const filePath = path.join(certDir, fileName);

    // If already exists
    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    }

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape"
    });

    doc.pipe(fs.createWriteStream(filePath));
    
    doc.fontSize(36).text("Certificate of Completion", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(28).text(user.name, { align: "center" });
    doc.moveDown();

    doc.fontSize(22).text(courseData.course.title, { align: "center" });
    doc.moveDown();

    doc.fontSize(18).text(
      `Score: ${courseData.score} / ${courseData.total}`,
      { align: "center" }
    );

    doc.moveDown();

    doc.fontSize(16).text(
      `Date: ${new Date().toDateString()}`,
      { align: "center" }
    );

    doc.end();

    await new Promise(resolve => doc.on("finish", resolve));

    res.download(filePath);

  } catch (err) {
    console.log("Generate cert error:", err);
    res.status(500).send("Server Error");
  }
};



