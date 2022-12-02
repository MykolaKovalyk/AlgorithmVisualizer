import { useEffect, useState } from "react";
import styles from "./Login.module.css"
import { Form, Formik, useField } from "formik"
import * as Yup from "yup"
import Button from "../basic/Button"
import { useAsyncError, useNavigate } from "react-router-dom"
import { logIn, register } from "../../requests"

const FormikInputField = ({label, ...props}) => {
    const [field, meta] = useField(props)

    return  (
        <>
            <label htmlFor={props.id || props.name}>{label}</label>
            <br/>
            <input className={styles.text_input} {...field} {...props}/>
            {
                meta.touched && meta.error ? (
                    <div className={styles.error}>{meta.error}</div>
                ) : null
            }
        </>
    )
}

async function sendLogin(loginData, navigate, setError) { 
    try {
        window.localStorage.setItem("loginData", JSON.stringify(await logIn(loginData)));
        navigate("/home")
    } catch(exc) {
        console.log(exc);
        setError(exc)
    }
}

async function sendRegister(loginData, navigate) { 
    try {
        window.localStorage.setItem("loginData", JSON.stringify(await register(loginData)));
        navigate("/home")
    } catch(exc) {
        console.log(exc);
    }
}

export default function Login() {
    const navigate = useNavigate()
    const [signIn, setSignIn] = useState(false)
    const [error, setError] = useState(null)

    return (
        <div className={styles.login}>
            <h1>{signIn ? "Register" : "Log In"}</h1>
            <Formik
                initialValues={{
                    name: "",
                    email: "",
                    password: ""
                }}
                validationSchema={Yup.object({
                    name: Yup
                        .string()
                        .test("non-empty-name", 
                        "Enter your name", 
                        value => (!(value == null)) && value.length > 0 || (!signIn)),
                    email: Yup
                        .string()
                        .email("This is not a valid email")
                        .required("Enter email"),
                    password: Yup
                        .string()
                        .required("Enter password")
                })}
                onSubmit={(values, {setSubmitting, resetForm}) => 
                { 
                    signIn ? sendRegister(values, navigate) : sendLogin(values, navigate, setError); 
                    return true
                }}
            >
                {props =>
                    <Form>
                        {signIn ? <><FormikInputField label="name" name="name" type="text"/><br/></> : null}
                        <FormikInputField label="email" name="email" type="email"/><br/>
                        <FormikInputField label="password" name="password" type="password"/><br/>
                        {error !== null && <div style={{color: "red", fontSize: "small"}}>Incorrect password</div>}
                        <a href="javascript:;" onClick={() => setSignIn(!signIn)}>{signIn ? "Already have an account? Sign in!" : "Don't have an account? Sign up!"}</a><br/>
                        <Button type="submit">{signIn ? 'Register' : 'Login'}</Button>
                    </Form>
                }
            </Formik>
        </div>
    )
}