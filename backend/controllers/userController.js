import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import Razorpay  from "razorpay";
import { CurrencyCodes } from "validator/lib/isISO4217.js";

// 🔑 Helper: Create JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ✅ API: Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      phone: "",
      address: { line1: "", line2: "" },
      gender: "",
      dob: "",
      image: "",
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ API: Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ API: Get User Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // 🔑 set by auth middleware
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, userData: user });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ API: Update User Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    let updateFields = { name, phone, dob, gender };

    if (address) {
      updateFields.address = JSON.parse(address);
    }

    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      updateFields.image = upload.secure_url;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updateFields, { new: true })
      .select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ API: Book Appointment (fixed with userData + docData)
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime, amount, date } = req.body;

    if (!req.userId || !docId || !slotDate || !slotTime || !amount || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Missing appointment details" });
    }

    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const newAppointment = new appointmentModel({
      userId: req.userId,
      docId,
      slotDate,
      slotTime,
      userData: user.toObject(),
      docData: doctor.toObject(),
      amount,
      date,
    });

    await newAppointment.save();

    res.json({
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to get user appointments for frontend my appointment page
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment

const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId; // from authUser middleware
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "appointmentId is required" });
    }

    // fetch appointment
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // verify ownership (compare strings to avoid ObjectId issues)
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    // mark as cancelled and return the updated appointment
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { cancelled: true },
      { new: true }
    );

    // release doctor slot safely
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    if (doctorData) {
      const slots_booked = doctorData.slots_booked || {};
      if (Array.isArray(slots_booked[slotDate])) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (e) => e !== slotTime
        );
      }
      await doctorModel.findByIdAndUpdate(
        docId,
        { slots_booked },
        { new: true }
      );
    }

    return res.json({
      success: true,
      message: "Appointment Cancelled",
      appointment: updatedAppointment, // return updated doc for frontend
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Api to make payment of appointment using razorpay

const razorpayInstance = new Razorpay ({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData =  await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointmnet Cancelld or not found",
      });
    }

    // creating options for the razorpay payment

    const options = {
      amount: appointmentData.amount * 100,
      currency:process.env.CURRENCY,
      receipt: appointmentId,
    };

    // creation of an order

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// API to verify payment of razorpay

const verifyRazorpay = async (req,res) =>{
  try {
    const {razorpay_order_id} = req.body
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
    
    if (orderInfo.status === 'paid') {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
      res.json({success:true,message:"Payment Successful"})
    }else{
        res.json({success:false,message:"Payment failed"})
    }

  } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
    
  }
}



export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay
};
