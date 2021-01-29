const nodemailer = require('nodemailer');

exports.sendEmail20 = ({ name, message, email }) => {

    let title = "";
    let subtitle = ""
    let emailTo = "";
    let bodyMessage =  "";

    title = "Conferencia Tedx Testing";
    subtitle = `${name} Te han enviado un mensaje`;
    emailTo = email;

    bodyMessage = `<div style='background:#efefef;padding:20px; border:1px solid #bdbdbd; border-radius:5px; margin:auto; display:block; width:400px'><h2>${ title }</h2><h3>${ subtitle }</h3><b>Nombre:</b> ${name} <br><b>Email:</b> ${email} <b><br><b>Mensaje:</b> ${message} </div> `;

    const mailOptions = {
    from: 'qreatech.company@gmail.com',
    to: emailTo,
    subject:` ${name} te ha enviado un mensaje desde el Formulario de contacto Website`,
    html:bodyMessage
    }; 

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'qreatech.company@gmail.com',
        pass: 'Vertical601.'
        }
    });

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error)
            res.json({
                error,
                message:"Error Email"

            })
            res.status(400);
        } else {
        res.status(200);
        res.json({
            message:"Email Sent"
        })
        }
    });



}

exports.sendEmailBasic = ({ name, message, email }) => {

    let title = "";
    let subtitle = ""
    let emailTo = "";
    let bodyMessage =  "";

    title = "Conferencia Tedx Testing";
    subtitle = `${name} Te han enviado un mensaje`;
    emailTo = email;

    bodyMessage = `<div style='background:#efefef;padding:30px; border:1px solid #bdbdbd; border-radius:5px; margin:auto; display:block; width:400px'><p>${message}</p></div> `;

    const mailOptions = {
    from: 'qreatech.company@gmail.com',
    to: emailTo,
    subject:` ${name} te ha enviado un mensaje desde el Formulario de contacto Website`,
    html:bodyMessage
    }; 

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'qreatech.company@gmail.com',
        pass: 'Vertical601.'
        }
    });

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error)
            res.json({
                error,
                message:"Error Email"

            })
            res.status(400);
        } else {
        res.status(200);
        res.json({
            message:"Email Sent"
        })
        }
    });



}

