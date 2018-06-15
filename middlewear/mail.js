var nodemailer = require('nodemailer');

module.exports=function mail(email,message){

    return new Promise((resolve, reject) => {
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            secureConnection: true,
            port:587,
            transportMethod: 'SMTP',
            auth: {
              // user: 'yashshah2331@gmail.com',
              // pass:'yash2331'
            }
          });
          
          var mailOptions = {
            from: '"yash" <yashshah2331@gmail.com>',
            to: email,
            subject: 'Sending Email using Node.js',
            text: message
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              return reject(error);
            } else {
              return resolve (info.response);
            }
          }); 

    })
}



