import {useState} from "react";
import {register} from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await register({email, password, name});
            console.log("Registered User: ", data);
            setEmailError("");
            navigate("/dashboard");
        }
        catch(err){
            console.error("Registration failed", err);
            setEmailError("This email is already in use.");
        }
    };


    return (
        <div className="min-h-screen w-screen flex">
            {/* LEFT SIDE – LOGIN FORM */}
            <div className="flex-[2] flex flex-col items-center justify-center p-6 sm:p-12 relative">
                <img
                    src="../../images/finance-logo.webp"
                    alt="Logo"
                    className="absolute top-6 left-6 w-40 h-40 object-contain"
                />
                <div 
                    className="w-full max-w-xs z-10"
                >
                <h1 className="text-2xl xl:text-3xl font-bold text-left">Sign Up</h1>
                <p className="text-s xl:text-m mb-8 text-left">Start Spending Wisely</p>
                <form
                    onSubmit={handleSubmit} 
                    className="w-full max-w-xs">
                <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-vivid-turquoise placeholder-gray-500 text-sm focus:outline-none focus:border-vivid-turquoise focus:bg-white"
                    type="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-vivid-turquoise placeholder-gray-500 text-sm focus:outline-none focus:border-vivid-turquoise focus:bg-white mt-5"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                    <p className="text-red-500 text-sm mt-1 text-left">
                        {emailError}
                    </p>
                )}
                <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-vivid-turquoise placeholder-gray-500 text-sm focus:outline-none focus:border-vivid-turquoise focus:bg-white mt-5"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="submit"
                    className="mt-5 tracking-wide font-semibold bg-vivid-turquoise text-gray-100 w-full py-4 rounded-lg hover:bg-turquoise transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                    <span>Sign Up</span>
                </button>
                <p className="w-full text-center mt-2">
                    Already have an account?{" "}
                    <a href="/Login" className="text-blue-500 hover:text-blue-700">
                    Sign In
                    </a>
                </p>
                </form>
            </div>
</div>
            {/* RIGHT SIDE – IMAGE */}
            <div className="flex-[3] hidden lg:flex">
                <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url("../../images/login-background-V2.webp")`,
                }}
                ></div>
            </div>
        </div>
    );
}