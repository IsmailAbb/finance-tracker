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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm mx-auto mt-10">
            <input type="email" placeholder="Email" value={email} onChange={ e => setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} onChange={ e => setPassword(e.target.value)}/>
            <button type="submit">Login</button>
        </form>
    );
}