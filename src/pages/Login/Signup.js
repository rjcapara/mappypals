import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Form from './Form.js';
import ErrorMessage from '../../components/ErrorMessages/ErrorMessages';
import { IsPasswordValid, IsPasswordIdentical } from '../../components/helper';
import './Login.css';
import ky from 'ky';
import Button from '../../components/UI/Button/Button';

class Signup extends Component {
    constructor(props) {
        super(props);
        window.FB.init({
            appId: '298824577401793',
            cookie: true,
            xfbml: true,
            version: 'v3.2'
        });

        this.state = {
            name: '',
            lastname: '',
            email: '',
            number: '',
            password: '',
            confirmPassword: '',
            passwordMatchError: false,
            passwordValidError: false,
            emailAlreadyExists: false
        };
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleSubmit = event => {
        const { password, confirmPassword } = this.state;
        event.preventDefault();
        const isPasswordValidVar = IsPasswordValid(password);
        const IsPasswordIdenticalVar = IsPasswordIdentical(
            password,
            confirmPassword
        );

        if (!IsPasswordIdenticalVar) {
            this.displayPasswordMatchError();
        } else if (!isPasswordValidVar) {
            this.hidePasswordMatchError();
            this.displayPasswordValidError();
        } else {
            this.hidePasswordMatchError();
            this.hidePasswordValidError();
            (async () => {
                const url = 'http://localhost:3001/users/register';
                await ky
                    .post(url, { json: this.state })
                    .then(res => {
                        if (res.status === 401) {
                            // email already exists
                            this.setState({ emailAlreadyExists: true });
                        } else {
                            this.props.history.push('/login');
                        }
                    })
                    .catch(err =>
                        alert(
                            'Server Error: Unable to register. Please try again.'
                        )
                    );
            })();
        }
    };
    displayPasswordMatchError = () =>
        this.setState({ passwordMatchError: true });
    hidePasswordMatchError = () => this.setState({ passwordMatchError: false });

    displayPasswordValidError = () =>
        this.setState({ passwordValidError: true });
    hidePasswordValidError = () => this.setState({ passwordValidError: false });

    // check if email already exists
    // in the background, after user leaves the email input field
    checkEmail = () => {
        fetch('http://localhost:3001/users/validate-email', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: this.state.email })
        })
            .then(res => {
                if (res.status === 200) {
                    return this.setState({ emailAlreadyExists: false });
                } else {
                    return this.setState({ emailAlreadyExists: true });
                }
            })
            .catch(err => console.log);
    };

    render() {
        let passwordMatchError = '';
        if (this.state.passwordMatchError) {
            passwordMatchError = (
                <ErrorMessage content="Password doesn't match" />
            );
        }
        let PasswordValidError = '';
        if (this.state.passwordValidError) {
            PasswordValidError = (
                <ErrorMessage content="At least 6 characters, a number or a symbol, at least 1 letter" />
            );
        }

        let EmailValidError = '';
        if (this.state.emailAlreadyExists) {
            EmailValidError = (
                <ErrorMessage content="This email is already in use." />
            );
        }

        const { checkLoginState } = this.props;
        return (
            <div className="Login" style={{ minHeight: `87.8vh` }}>
                <Form onSubmit={this.handleSubmit}>
                    <fieldset>
                        <div className="nameContainer">
                            <label className="item1" htmlFor="firstname">
                                Firstname
                                <input
                                    type="text"
                                    id="firstname"
                                    className="item2"
                                    name="name"
                                    onChange={this.handleChange}
                                    required
                                />
                            </label>
                            <label className="item3" htmlFor="lastname">
                                Lastname
                                <input
                                    type="text"
                                    id="lastname"
                                    className="item4"
                                    name="lastname"
                                    onChange={this.handleChange}
                                    required
                                />
                            </label>
                        </div>
                        <label htmlFor="email">
                            Email
                            <input
                                type="email"
                                name="email"
                                onChange={this.handleChange}
                                onBlur={this.checkEmail}
                                required
                            />
                            {EmailValidError}
                        </label>
                        <label htmlFor="password">
                            Password
                            <input
                                type="password"
                                name="password"
                                aria-describedby="newPassword"
                                value={this.state.password}
                                onClick={this.toggleHidden}
                                onChange={this.handleChange}
                                required
                            />
                            {PasswordValidError}
                        </label>
                        <label htmlFor="confirmPassword">
                            Confirm password
                            <input
                                type="password"
                                name="confirmPassword"
                                value={this.state.checkPassword}
                                onChange={this.handleChange}
                                required
                            />
                            {passwordMatchError}
                        </label>
                        <div className="btnContainer">
                            <Button btnType="Submit" type="submit">
                                Create Account
                            </Button>
                        </div>
                    </fieldset>
                    <p className="u-text-center">Or connect with: </p>
                    <div className="btnContainer">
                        <label
                            htmlFor="fb-login-button"
                            aria-label="Login with Facebook"
                        >
                            <div
                                className="fb-login-button"
                                display="inline-block"
                                data-size="large"
                                data-button-type="login_with"
                                data-auto-logout-link="false"
                                data-use-continue-as="false"
                                onClick={checkLoginState}
                            />
                        </label>
                    </div>
                    <p className="u-text-center">
                        Already have an account?
                        <Link className="nav-item" to="/login">
                            {' '}
                            Login{' '}
                        </Link>
                    </p>
                </Form>
            </div>
        );
    }
}

export default Signup;
