import {useState} from "react";
import {login} from "../services/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await login({email, password});
            console.log("Logged in user: ", data);
        }
        catch(err){
            console.error("Login failed", err);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
            <input type="email" placeholder="Email" value={email} onChange={ e => setEmail(e.target.value)} className="w-full p-3 mb-4 border border-gray-300 rounded"/>
            <input type="password" placeholder="Password" value={password} onChange={ e => setPassword(e.target.value)} className="w-full p-3 mb-4 border border-gray-300 rounded"/>
            <button className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600" type="submit">Login</button>
        </form>
    );
}