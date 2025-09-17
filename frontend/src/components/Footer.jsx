import React from "react";
import { assets } from "../assets/assets";
const Footer = () => {
  return (
    <div className="md:mx-10">
      <div
        className="grid gap-14 my-10 mt-40 text-sm"
        style={{ gridTemplateColumns: "3fr 1fr 1fr" }}
      >
        {/* left section */}
        <div className="flex flex-col">
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quas quae
            libero repellendus natus ad voluptatem!
          </p>
        </div>

        {/* center section */}
        <div>
          <p className="text-xl font-medium mb-5">Company</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li className="cursor-pointer">Home</li>
            <li className="cursor-pointer">About us</li>
            <li className="cursor-pointer">Contact us</li>
            <li className="cursor-pointer">Privacy policy</li>
          </ul>
        </div>

        {/* right section */}
        <div>
          <p className="text-xl font-medium mb-5">Get in Touch</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+1-2122-4000</li>
            <li>prescrepto@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* copyright section */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2025@ Prescripto - All Right Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
