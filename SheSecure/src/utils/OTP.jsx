import { api } from "../config/config";

export const sendMobileOTP=(setMobileTimer, mobile)=>{
    setMobileTimer(59);
}

export const sendEmailOTP=(setEmailTimer, email)=>{
    setEmailTimer(59);
    // fetch(api+'/auth/send-otp',{
    //     method :'POST',
    //     credentials: 'include',
    //     headers: {'content-type':'application/json'},
    //     body: JSON.stringify({email})
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if(data.success)
    //         alert('Email sent')
    //     else
    //         alert(data.message);
    // })    
}

export const verifyEmail=(setIsEmailVerify, emailOTP)=>{
    // fetch(api+'/auth/verify-otp',{
    //     method :'POST',
    //     credentials: 'include',
    //     headers: {'content-type':'application/json'},
    //     body: JSON.stringify({emailOTP})
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if(data.success)
    //         setIsEmailVerify(true);
    //     else
    //         alert(data.message);
    // })
}

export const verifyMobile=(setIsMobileVerify, mobileOTP)=>{
    setIsMobileVerify(true);
}