import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData,setDashData] = useState(false)
  const [atoken, setAtoken] = useState(
    localStorage.getItem("atoken") ? localStorage.getItem("atoken") : ""
  );
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Fetch all doctors
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        { headers: { atoken } }
      );
      if (data.success) {
        setDoctors(data.doctors);
        console.log("Doctors:", data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error.response || error.message);
      toast.error(error.message);
    }
  };

  // ✅ Change doctor availability
  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { atoken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error changing availability:", error.response || error.message);
      toast.error(error.message);
    }
  };

  // ✅ Fetch all appointments (fixed headers bug)
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { atoken },
      });
      if (data.success) {
        setAppointments(data.appointments);
        console.log("Appointments:", data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error.response || error.message);
      toast.error(error.message);
    }
  };

  // ✅ Automatically fetch doctors + appointments on mount if token exists
  useEffect(() => {
    console.log("Backend URL:", backendUrl);
    if (atoken) {
      getAllDoctors();
      getAllAppointments();
    }
  }, [atoken]);


  const cancelAppointment = async(appointmentId) =>{

    try {
      const {data} = await axios.post(backendUrl + '/api/admin/cancel-appointment',{appointmentId},{headers:{atoken}})
      if (data.success) {
        toast.success(data.message)
        getAllAppointments()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }


  const getDashData = async () =>{
    try {
      const {data} = await axios.get(backendUrl + '/api/admin/dashboard',{headers:{atoken}})
      if (data.success) {
        setDashData(data.dashData)
        console.log(data.dashData)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }


  const value = {
    atoken,
    setAtoken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,

  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
