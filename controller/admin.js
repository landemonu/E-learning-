import User from "../model/user.js";
import Course from "../model/instructorCourse.js";   // ✅ only ONE course model
import Order from "../model/order.js";

/* ================= DASHBOARD ================= */
export const adminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalCourses = await Course.countDocuments();
    const totalOrders = await Order.countDocuments({ status: "SUCCESS" });

    res.render("adminDashboard", {
      totalStudents,
      totalInstructors,
      totalCourses,
      totalOrders
    });
  } catch (err) {
    console.log(err);
    res.send("adminDashboard error");
  }
};

/* ================= USERS ================= */
export const adminUsers = async (req, res) => {
  try {
    const users = await User.find();

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {

        let orders = [];
        let coursesCount = 0;

        // STUDENT → orders
        if (user.role === "student") {
          orders = await Order.find({ userId: user._id })
            .populate("courseId"); // 👈 no field restriction (safer)
        }

        // INSTRUCTOR → uploaded courses
        if (user.role === "instructor") {
          coursesCount = await Course.countDocuments({
            instructor: user._id
          });
        }

        return {
          ...user.toObject(),
          orders,
          coursesCount
        };
      })
    );

    res.render("adminUsers", { users: usersWithDetails });

  } catch (err) {
    console.error("ADMIN USERS ERROR ↓↓↓");
    console.error(err);
    res.send("Users page error");
  }
};


/* ================= COURSES ================= */
export const adminCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email"); // ✅ correct field

    const coursesWithOrders = await Promise.all(
      courses.map(async (course) => {
        const ordersCount = await Order.countDocuments({
          courseId: course._id,
          status: "SUCCESS"
        });

        return {
          ...course.toObject(),
          ordersCount
        };
      })
    );

    res.render("adminCourses", { courses: coursesWithOrders });
  } catch (err) {
    console.log("ADMIN COURSES ERROR:", err);
    res.send("Courses page error");
  }
};


/* ================= REPORTS ================= */
export const adminReports = async (req, res) => {
  try {
    const orders = await Order.find({ status: "SUCCESS" })
      .populate("userId", "name email")
      .populate("courseId", "title price")
      .sort({ createdAt: -1 });

    res.render("adminReports", { orders }); // 👈 orders name important
  } catch (err) {
    console.log(err);
    res.send("Reports error");
  }
};


/* ================= DELETE USER ================= */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/adminUsers");
    }

    // ❌ Never delete admin
    if (user.role === "admin") {
      return res.status(403).send("Cannot delete admin user");
    }

    // 🧑‍🎓 Student → delete orders
    if (user.role === "student") {
      await Order.deleteMany({ userId });
    }

    // 👨‍🏫 Instructor → delete courses + related orders
    if (user.role === "instructor") {
      const courses = await Course.find({ instructorId: userId });

      const courseIds = courses.map(c => c._id);

      await Order.deleteMany({ courseId: { $in: courseIds } });
      await Course.deleteMany({ instructorId: userId });
    }

    // 🗑 Finally delete user
    await User.findByIdAndDelete(userId);

    res.redirect("/adminUsers");
  } catch (err) {
    console.log(err);
    res.send("Delete user error");
  }
};

/* ================= DELETE COURSE ================= */
export const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    await Order.deleteMany({ courseId });
    await Course.findByIdAndDelete(courseId);

    res.redirect("/adminCourses");
  } catch (err) {
    console.log(err);
    res.send("Delete course error");
  }
};
