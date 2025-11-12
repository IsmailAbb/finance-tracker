import {useState} from "react";
import {register} from "../services/auth";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await register({email, password, name});
            console.log("Registered User: ", data);
        }
        catch(err){
            console.error("Registration failed", err);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm mx-auto mt-10">
            <input type="text" placeholder="Name" value={name} onChange={ e => setName(e.target.value)}/>
            <input type="email" placeholder="Email" value={email} onChange={ e => setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} onChange={ e => setPassword(e.target.value)}/>
            <button type="submit">Register</button>
        </form>
    );
}