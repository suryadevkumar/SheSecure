import { useRouteError } from "react-router-dom";
const Error=()=>{
    const err=useRouteError();
    return(
        <>
            <h1 className="text-3xl text-red-500 font-bold">OOPS Not Found!</h1>
            <h1 className="text-2xl">Status Code: {err.status} <br />Status: {err.statusText}</h1>
        </>
    )
}

export default Error;