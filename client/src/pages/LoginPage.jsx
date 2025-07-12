// import React, { useContext, useEffect, useState } from "react";
// import assets from "../assets/assets";
// import { AuthContext } from "../../context/AuthContext.jsx";

// const LoginPage = () => {
//   const [currentState, setCurrentState] = useState("Sign up");
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [bio, setBio] = useState("");
//   const [iseDataSubmitted, setIsDataSubmitted] = useState(false);
//   const {login} = useContext(AuthContext)
//   // useEffect(() => {
//   //   console.log("vfj")
//   // },[])
//   const onSubmitHanler = (e) => {
//     e.preventDefault();
//     if (currentState === 'Sign up' && !iseDataSubmitted) {
//       setIsDataSubmitted(true);
//       return;
//     }

//     login(currentState === "Sign up" ? "signup" : "login", {
//       fullName,email,password,bio
//     })

//   }
//   return (
//     <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
//       {/* left */}
//       <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />
//       {/* right */}

//       <form onSubmit={onSubmitHanler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
//         <h2 className="font-medium text-2xl flex justify-between items-center">
//           {currentState}
//           {iseDataSubmitted && (
//             <img
//               onClick={() => setIsDataSubmitted(false)}
//               src={assets.arrow_icon}
//               alt=""
//               className="w-5 cursor-pointer"
//               onChange
//             />
//           )}
//         </h2>

//         {currentState == "Sign up" && !iseDataSubmitted && (
//           <input
//             type="text"
//             className="p-2 border order-gray-500 rounded-md focus:outline-none"
//             placeholder="Full Name"
//             required
//             onChange={(e) => setFullName(e.target.value)}
//           />
//         )}
//         {!iseDataSubmitted && (
//           <>
//             <input
//               type="email"
//               placeholder="Email address"
//               required
//               className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </>
//         )}

//         {currentState == "Sign up" && iseDataSubmitted && (
//           <textarea
//             rows={4}
//             className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             placeholder="Provide a short bio..."
//             required
//             onChange={(e) => setBio(e.target.value)}
//             value={bio}
//           ></textarea>
//         )}

//         <button
//           className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
//           type="submit"
//         >
//           {currentState === "Sign up" ? "Create Account" : "Login Now"}
//         </button>
//         <div className="flex items-center gap-2 text-sm text-gray-500">
//           <input type="checkbox" />
//           <p>Agree to the terms of use & privacy policy.</p>
//         </div>

//         <div className="flex flex-col gap-2">
//           {currentState === "Sign up" ? (
//             <p className="text-sm text-gray-600">
//               Already have an account{" "}
//               <span
//                 className="font-medium text-violet-500 cursor-pointer"
//                 onClick={() => {
//                   setCurrentState("Login");
//                   setIsDataSubmitted(false);
//                 }}
//               >
//                 Login here
//               </span>{" "}
//             </p>
//           ) : (
//             <p className="text-sm text-gray-600">
//               Create an account{" "}
//               <span
//                 className="font-medium text-violet-500 cursor-pointer"
//                 onClick={() => {
//                   setCurrentState("Sign up");
//                 }}
//               >
//                 Click here
//               </span>
//             </p>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;

// src/pages/LoginPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext.jsx";

const LoginPage = () => {
  const [currentState, setCurrentState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login, authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect to home as soon as authUser exists
  useEffect(() => {
    if (authUser) {
      navigate("/", { replace: true });
    }
  }, [authUser, navigate]);

  const onSubmitHandler = (e) => {
    e.preventDefault();

    // first step of signup: collect name/email/password
    if (currentState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    // perform login or signup
    login(currentState === "Sign up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
    });
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* left */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />

      {/* right */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currentState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="go back"
              className="w-5 cursor-pointer"
            />
          )}
        </h2>

        {/* Name step (signup only) */}
        {currentState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        {/* Email & Password */}
        {!isDataSubmitted && (
          <>
            <input
              type="email"
              placeholder="Email address"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {/* Bio step (signup second step) */}
        {currentState === "Sign up" && isDataSubmitted && (
          <textarea
            rows={4}
            placeholder="Provide a short bio..."
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        )}

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md"
        >
          {currentState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className="flex flex-col gap-2">
          {currentState === "Sign up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                className="font-medium text-violet-500 cursor-pointer"
                onClick={() => {
                  setCurrentState("Login");
                  setIsDataSubmitted(false);
                }}
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create an account{" "}
              <span
                className="font-medium text-violet-500 cursor-pointer"
                onClick={() => {
                  setCurrentState("Sign up");
                  setIsDataSubmitted(false);
                }}
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
