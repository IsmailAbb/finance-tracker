import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const data = await login({ email, password });
        console.log("Logged in user: ", data);
        navigate("/dashboard");
        } catch (err) {
        console.error("Login failed", err);
        }
    };

    return (
        <div className="min-h-screen w-screen flex">
            {/* LEFT SIDE – LOGIN FORM */}
            <div className="flex-[2] flex flex-col items-center justify-center p-6 sm:p-12">
                <img
                    src="../../images/finance-logo.webp"
                    alt="Logo"
                    className="absolute top-6 left-6 w-40 h-40 object-contain"
                />
                <div 
                    className="w-full max-w-xs"
                >
                <h1 className="text-2xl xl:text-3xl font-bold text-left">Welcome Back!</h1>
                <p className="text-s xl:text-m mb-8 text-left">Start Spending Wisely</p>
                {/*test2@hotmail.com, test2*/}
                <form 
                    onSubmit={handleSubmit} 
                    className="w-full max-w-xs">
                <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-vivid-turquoise placeholder-gray-500 text-sm focus:outline-none focus:border-vivid-turquoise focus:bg-white"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
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
                    <span>Login</span>
                </button>
                <p className="w-full text-center mt-2">
                    Don’t have an account?{" "}
                    <a href="/Register" className="text-blue-500 hover:text-blue-700">
                    Sign Up
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
