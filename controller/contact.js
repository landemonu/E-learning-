export async function contact(req,res){
    const contactInfo = {
        phone: "+91 9876543210",
        email: "info@example.com",
        address: "123, Pune, Maharashtra, India",
        mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.8151055297123!2d73.856743!3d18.520430!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c086b8d9b9d7%3A0x7e6b1b0f3a7b4d1d!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"

    };
    await res.render('contact', { contact: contactInfo });
};
