import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData, user } =
    useContext(AppContext);

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  const navigate = useNavigate();

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const fetchDocInfo = async () => {
    const foundDoc = doctors.find((doc) => doc._id === docId);
    setDocInfo(foundDoc);
  };

  const getAvailableSlots = () => {
    const today = new Date();
    const now = new Date();
    const allSlots = [];

    for (let i = 0; i < 7; i++) {
      const baseDate = new Date(today);
      baseDate.setDate(today.getDate() + i);
      baseDate.setHours(10, 0, 0, 0);

      let startTime = new Date(baseDate);

      if (i === 0) {
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        if (currentMinutes < 30) {
          startTime.setHours(currentHour, 30, 0, 0);
        } else {
          startTime.setHours(currentHour + 1, 0, 0, 0);
        }

        if (startTime.getHours() >= 21) {
          allSlots.push([]);
          continue;
        }
      }

      const endTime = new Date(baseDate);
      endTime.setHours(21, 0, 0, 0);

      const slots = [];
      let slot = new Date(startTime);

      while (slot < endTime) {
        const formattedTime = slot.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        slots.push({
          datetime: new Date(slot),
          time: formattedTime,
        });

        slot.setMinutes(slot.getMinutes() + 30);
      }

      allSlots.push(slots);
    }

    setDocSlots(allSlots);
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }

    if (!docInfo || !docInfo._id) {
      toast.warn("Doctor info missing");
      return;
    }

    try {
      const selectedSlot = docSlots[slotIndex].find(
        (slot) => slot.time === slotTime
      );
      const selectedDate = selectedSlot?.datetime;

      if (!selectedDate) {
        toast.warn("Invalid time slot selected");
        return;
      }

      // ✅ Only send the fields required by backend
      const requestData = {
        docId: docInfo._id,
        slotDate: `${selectedDate.getDate()}_${
          selectedDate.getMonth() + 1
        }_${selectedDate.getFullYear()}`,
        slotTime,
        amount: docInfo.fees,
        date: selectedDate.getTime(),
      };

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        requestData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Booking error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };
  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) getAvailableSlots();
  }, [docInfo]);

  return (
    docInfo && (
      <div>
        {/* Doctor Details */}
        <div className="flex flex-col sm:flex-row gap-4 ">
          <div>
            <img
              className="bg-[#5f6FFF] w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>

          <div className="flex-1 border-gray-400 border rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>

            {/* About */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>

            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking Slots</p>

          {/* Days */}
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4 ">
            {docSlots.map((slots, index) => (
              <div
                onClick={() => {
                  setSlotIndex(index);
                  setSlotTime("");
                }}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index
                    ? "bg-[#5f6FFF] text-white"
                    : "border border-gray-200"
                }`}
                key={index}
              >
                <p>
                  {slots.length > 0
                    ? daysOfWeek[slots[0].datetime.getDay()]
                    : daysOfWeek[(new Date().getDay() + index) % 7]}
                </p>
                <p>
                  {slots.length > 0
                    ? slots[0].datetime.getDate()
                    : new Date(
                        new Date().setDate(new Date().getDate() + index)
                      ).getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots.length > 0 &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 border rounded-full cursor-pointer ${
                    item.time === slotTime
                      ? "bg-[#5f6FFF] text-white"
                      : "text-gray-400 border-gray-300"
                  }`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button
            onClick={bookAppointment}
            className="bg-[#5f6FFF] text-white text-sm font-light px-14 py-3 rounded-full my-6 cursor-pointer"
          >
            Book an Appointment
          </button>
        </div>

        {/* Listing related doctors */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
