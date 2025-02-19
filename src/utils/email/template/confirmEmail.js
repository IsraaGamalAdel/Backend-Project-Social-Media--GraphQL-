export const confirmEmail = ` <!DOCTYPE html>
<html lang="ar">
    <head>
        <meta charset="UTF-8">
        <style type="text/css">
            body {
                background-color: #9b4caf7f; 
                margin: 0px;
                font-family: Arial, sans-serif;
            }
            .input-field {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #9b4caf;
                border-radius: 4px;
            }
            .submit-button {
                background-color: #fff;
                color: #9b4caf;
                padding: 10px 20px;
                border: 2px solid #ddd;
                border-color: #9b4caf;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            }
            .submit-button:hover {
                color: #fff;
                background-color: #9b4caf;
            }
        </style>
    </head>
    <body style="margin: 0px;">
        <div class="container">
        <table border="0" width="50%" 
            style="margin: auto; margin-top: 100px; padding: 30px; border: 1px solid #9b4caf; border-radius: 10px; background-color: rgba(255, 255, 255, 0.789); box-shadow: -5px 2px 54px -9px rgba(0, 0, 0, 1);"
        >
            <tr>
                <td>
                    <table border="0" width="100%" >
                        <tr>
                            <td>
                                <h1>
                                    <img width="100%" src="path_to_your_logo.png" alt="Academy Logo" class="logo">
                                </h1>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table border="0" width="100%">
                        <tr>
                            <td style="padding: 20px 0;">
                                <h2 style="text-align: center;">Welcome to our academy</h2>
                                <p style="text-align: center;"> Please login to your account with your details</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <form action="http://localhost:5173/login" >
                                    <div style="text-align: center;">
                                        <p>Email: <span class="credentials">user@example.com</span></p>
                                        <p>Password: <span class="credentials">your_password</span></p>
                                    </div>
                                    
                                    <div style="text-align: center; margin-top: 20px;">
                                        <input type="submit" value="Login" class="submit-button"/>
                                    </div>
                                </form>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        </div>
    </body>
</html>
`