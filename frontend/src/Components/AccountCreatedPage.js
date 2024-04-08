import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar';

function AccountCreatedPage() {


    return (
        <><div /><Navbar />

            <div class="account-form">
                <h1>Account Created <i class="fa-regular fa-circle-check"></i></h1>

                <p>
                    <span style={{ color: 'white' }}>A confirmation has been sent to your email.</span> {' '}
                    <br></br>
                    <br></br>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <span style={{ color: 'white' }}>Ready to login?</span> {' '}
                        <Link to="/Login" className="btn btn-login mr-2" >Login</Link>
                    </div>
                </p>
            </div>
        </>
    );
}

export default AccountCreatedPage;