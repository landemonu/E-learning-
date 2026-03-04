export async function  about(req,res){
    const data = {
        title: "About Our E-Learning Platform",
        description: "We provide high-quality online courses for students, instructors, and organizations with an easy-to-use LMS system.",
        mission: "To make skill-based education accessible, affordable, and flexible for everyone.",
        vision: "To become the most trusted platform for online education and professional development.",
        features: [
            "Student Dashboard & Progress Tracking",
            "Instructor Course Management Panel",
            "Admin Control & Analytics",
            "Smart Certificate Generator",
            "User-Friendly UI",
            "Secure Login & Role-Based Access"
        ],
        team: [
            { name: "Tina Sharma", role: "Fullstack Developer", img: "/about/monu.avif" },
            { name: "Ravi Kapoor", role: "Backend Developer", img: "/about/ravi.avif" },
            { name: "Melania Trump", role: "UI/UX Designer", img: "/about/c.png" }
        ]
    };

     await res.render("about", { data });
    
};
