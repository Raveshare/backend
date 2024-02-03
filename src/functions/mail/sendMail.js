const resend = require("../../utils/resend");

const sendMail = async (email, subject, username) => {
  let { data, error } = await resend.emails.send({
    // from: "noreply@lenspost.xyz",
    from: "onboarding@resend.dev",
    to: email,
    subject: subject,
    html: `
    <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>New Message</title>
    <!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]-->
    <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml>
    <![endif]--> <!--[if !mso]><!-- -->
    <link href="https://fonts.googleapis.com/css2?family=Imprima&display=swap" rel="stylesheet"> <!--<![endif]-->
    <style type="text/css">
        .rollover:hover .rollover-first {
            max-height: 0px !important;
            display: none !important;
        }

        .rollover:hover .rollover-second {
            max-height: none !important;
            display: block !important;
        }

        .rollover span {
            font-size: 0px;
        }

        u+.body img~div div {
            display: none;
        }

        #outlook a {
            padding: 0;
        }

        span.MsoHyperlink,
        span.MsoHyperlinkFollowed {
            color: inherit;
            mso-style-priority: 99;
        }

        a.es-button {
            mso-style-priority: 100 !important;
            text-decoration: none !important;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        .es-desk-hidden {
            display: none;
            float: left;
            overflow: hidden;
            width: 0;
            max-height: 0;
            line-height: 0;
            mso-hide: all;
        }

        .es-button-border:hover>a.es-button {
            color: #ffffff !important;
        }

        @media only screen and (max-width:600px) {
            *[class="gmail-fix"] {
                display: none !important
            }

            p,
            a {
                line-height: 150% !important
            }

            h1,
            h1 a {
                line-height: 120% !important
            }

            h2,
            h2 a {
                line-height: 120% !important
            }

            h3,
            h3 a {
                line-height: 120% !important
            }

            h4,
            h4 a {
                line-height: 120% !important
            }

            h5,
            h5 a {
                line-height: 120% !important
            }

            h6,
            h6 a {
                line-height: 120% !important
            }

            h1 {
                font-size: 30px !important;
                text-align: left
            }

            h2 {
                font-size: 24px !important;
                text-align: left
            }

            h3 {
                font-size: 20px !important;
                text-align: left
            }

            h4 {
                font-size: 24px !important;
                text-align: left
            }

            h5 {
                font-size: 20px !important;
                text-align: left
            }

            h6 {
                font-size: 16px !important;
                text-align: left
            }

            .es-header-body h1 a,
            .es-content-body h1 a,
            .es-footer-body h1 a {
                font-size: 30px !important
            }

            .es-header-body h2 a,
            .es-content-body h2 a,
            .es-footer-body h2 a {
                font-size: 24px !important
            }

            .es-header-body h3 a,
            .es-content-body h3 a,
            .es-footer-body h3 a {
                font-size: 20px !important
            }

            .es-header-body h4 a,
            .es-content-body h4 a,
            .es-footer-body h4 a {
                font-size: 24px !important
            }

            .es-header-body h5 a,
            .es-content-body h5 a,
            .es-footer-body h5 a {
                font-size: 20px !important
            }

            .es-header-body h6 a,
            .es-content-body h6 a,
            .es-footer-body h6 a {
                font-size: 16px !important
            }

            .es-menu td a {
                font-size: 14px !important
            }

            .es-header-body p,
            .es-header-body a {
                font-size: 14px !important
            }

            .es-content-body p,
            .es-content-body a {
                font-size: 14px !important
            }

            .es-footer-body p,
            .es-footer-body a {
                font-size: 14px !important
            }

            .es-infoblock p,
            .es-infoblock a {
                font-size: 12px !important
            }

            .es-m-txt-c,
            .es-m-txt-c h1,
            .es-m-txt-c h2,
            .es-m-txt-c h3,
            .es-m-txt-c h4,
            .es-m-txt-c h5,
            .es-m-txt-c h6 {
                text-align: center !important
            }

            .es-m-txt-r,
            .es-m-txt-r h1,
            .es-m-txt-r h2,
            .es-m-txt-r h3,
            .es-m-txt-r h4,
            .es-m-txt-r h5,
            .es-m-txt-r h6 {
                text-align: right !important
            }

            .es-m-txt-j,
            .es-m-txt-j h1,
            .es-m-txt-j h2,
            .es-m-txt-j h3,
            .es-m-txt-j h4,
            .es-m-txt-j h5,
            .es-m-txt-j h6 {
                text-align: justify !important
            }

            .es-m-txt-l,
            .es-m-txt-l h1,
            .es-m-txt-l h2,
            .es-m-txt-l h3,
            .es-m-txt-l h4,
            .es-m-txt-l h5,
            .es-m-txt-l h6 {
                text-align: left !important
            }

            .es-m-txt-r img,
            .es-m-txt-c img,
            .es-m-txt-l img {
                display: inline !important
            }

            .es-m-txt-r .rollover:hover .rollover-second,
            .es-m-txt-c .rollover:hover .rollover-second,
            .es-m-txt-l .rollover:hover .rollover-second {
                display: inline !important
            }

            .es-m-txt-r .rollover span,
            .es-m-txt-c .rollover span,
            .es-m-txt-l .rollover span {
                line-height: 0 !important;
                font-size: 0 !important
            }

            .es-spacer {
                display: inline-table
            }

            a.es-button,
            button.es-button {
                font-size: 18px !important;
                line-height: 120% !important
            }

            a.es-button,
            button.es-button,
            .es-button-border {
                display: block !important
            }

            .es-m-fw,
            .es-m-fw.es-fw,
            .es-m-fw .es-button {
                display: block !important
            }

            .es-m-il,
            .es-m-il .es-button,
            .es-social,
            .es-social td,
            .es-menu {
                display: inline-block !important
            }

            .es-adaptive table,
            .es-left,
            .es-right {
                width: 100% !important
            }

            .es-content table,
            .es-header table,
            .es-footer table,
            .es-content,
            .es-footer,
            .es-header {
                width: 100% !important;
                max-width: 600px !important
            }

            .adapt-img {
                width: 100% !important;
                height: auto !important
            }

            .es-mobile-hidden,
            .es-hidden {
                display: none !important
            }

            .es-desk-hidden {
                width: auto !important;
                overflow: visible !important;
                float: none !important;
                max-height: inherit !important;
                line-height: inherit !important
            }

            tr.es-desk-hidden {
                display: table-row !important
            }

            table.es-desk-hidden {
                display: table !important
            }

            td.es-desk-menu-hidden {
                display: table-cell !important
            }

            .es-menu td {
                width: 1% !important
            }

            table.es-table-not-adapt,
            .esd-block-html table {
                width: auto !important
            }

            .es-social td {
                padding-bottom: 10px
            }

            .h-auto {
                height: auto !important
            }

            a.es-button,
            button.es-button {
                border-top-width: 15px !important;
                border-bottom-width: 15px !important
            }
        }

        @media screen and (max-width:384px) {
            .mail-message-content {
                width: 414px !important
            }
        }
    </style>
</head>

<body class="body" style="width:100%;height:100%;padding:0;Margin:0">
    <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#FFFFFF">
        <!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#ffffff"></v:fill> </v:background><![endif]-->
        <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
            <tr>
                <td valign="top" style="padding:0;Margin:0">
                    <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#fff559" class="es-content-body" align="center" cellpadding="0"
                                    cellspacing="0"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff559;border-radius:20px 20px 0 0;width:600px"
                                    role="none">
                                    <tr>
                                        <td align="left"
                                            style="padding:0;Margin:0;padding-right:40px;padding-left:40px;padding-top:40px">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="center" valign="top"
                                                        style="padding:0;Margin:0;width:520px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            role="presentation"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="left" class="es-m-txt-c"
                                                                    style="padding:0;Margin:0;font-size:0px"><a
                                                                        target="_blank" href="https://viewstripo.email"
                                                                        style="mso-line-height-rule:exactly;text-decoration:underline;color:#2D3142;font-size:18px"><img
                                                                            src="https://ffeyfxm.stripocdn.email/content/guids/CABINET_60cab775ec13cde5aa6f530ead9b4b5f7ebfb92e4653ea011448721f03bce804/images/copy_of_lenspost_logo_filesremovebgpreview.png"
                                                                            alt="Confirm email"
                                                                            style="display:block;font-size:18px;border:0;outline:none;text-decoration:none;border-radius:100px"
                                                                            width="100" title="Confirm email"
                                                                            height="100"></a> </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left"
                                            style="padding:0;Margin:0;padding-top:20px;padding-right:40px;padding-left:40px">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="center" valign="top"
                                                        style="padding:0;Margin:0;width:520px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            bgcolor="#fafafa"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#fafafa;border-radius:10px"
                                                            role="presentation">
                                                            <tr>
                                                                <td align="left" style="padding:20px;Margin:0">
                                                                    <h3
                                                                        style="Margin:0;font-family:Imprima, Arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:28px;font-style:normal;font-weight:bold;line-height:34px;color:#2D3142">
                                                                        Welcome,&nbsp;${username}</h3>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:27px;letter-spacing:0;color:#2D3142;font-size:18px">
                                                                        <br>
                                                                    </p>
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:27px;letter-spacing:0;color:#2D3142;font-size:18px">
                                                                        You're receiving this message because you
                                                                        recently signed up for a account.
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#fff559" class="es-content-body" align="center" cellpadding="0"
                                    cellspacing="0" role="none"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff559;width:600px">
                                    <tr>
                                        <td align="left"
                                            style="padding:0;Margin:0;padding-right:40px;padding-left:40px">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <br>
                                                <br>
                                                <tr>
                                                    <td align="center" valign="top"
                                                        style="padding:0;Margin:0;width:520px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            role="presentation"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0">
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:27px;letter-spacing:0;color:#2D3142;font-size:18px">
                                                                        Thanks,<br>Lenspost Labs</p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;padding-bottom:20px;padding-top:40px;font-size:0">
                                                                    <table border="0" width="100%" height="100%"
                                                                        cellpadding="0" cellspacing="0"
                                                                        role="presentation"
                                                                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr>
                                                                            <td
                                                                                style="padding:0;Margin:0;border-bottom:1px solid #666666;background:unset;height:1px;width:100%;margin:0px">
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#fff559" class="es-content-body" align="center" cellpadding="0"
                                    cellspacing="0"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff559;border-radius:0 0 20px 20px;width:600px"
                                    role="none">
                                    <tr>
                                        <td class="esdev-adapt-off" align="left"
                                            style="Margin:0;padding-top:20px;padding-right:40px;padding-bottom:20px;padding-left:40px">
                                            <table cellpadding="0" cellspacing="0" class="esdev-mso-table" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:520px">
                                                <tr>
                                                    <td style="padding:0;Margin:0;width:20px"></td>
                                                    <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                        <table cellpadding="0" cellspacing="0" class="es-right"
                                                            align="right" role="none"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                                            <tr>
                                                                <td align="center" valign="top"
                                                                    style="padding:0;Margin:0;width:453px">
                                                                    <table cellpadding="0" cellspacing="0" width="100%"
                                                                        role="presentation"
                                                                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr>
                                                                            <td align="left" style="padding:0;Margin:0">
                                                                                <p
                                                                                    style="Margin:0;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:24px;letter-spacing:0;color:#2D3142;font-size:16px">
                                                                                    <a target="_blank"
                                                                                        style="mso-line-height-rule:exactly;text-decoration:underline;color:#2D3142;font-size:16px"
                                                                                        href="">we're here to help, happy remixing</a>
                                                                                </p>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#bcb8b1" class="es-footer-body" align="center" cellpadding="0"
                                    cellspacing="0" role="none"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                    <tr>
                                        <td align="left"
                                            style="Margin:0;padding-top:40px;padding-right:20px;padding-bottom:30px;padding-left:20px">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="left" style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            role="presentation"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center" class="es-m-txt-c"
                                                                    style="padding:0;Margin:0;padding-bottom:20px;padding-top:10px;font-size:0">
                                                                    <table cellpadding="0" cellspacing="0"
                                                                        class="es-table-not-adapt es-social"
                                                                        role="presentation"
                                                                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr>
                                                                            <td align="center" valign="top"
                                                                                style="padding:0;Margin:0;padding-right:5px">
                                                                                <img src="https://ffeyfxm.stripocdn.email/content/assets/img/social-icons/logo-black/x-logo-black.png"
                                                                                    alt="X" title="X.com" height="24"
                                                                                    width="24"
                                                                                    style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
                                                                            </td>
                                                                            <td align="center" valign="top"
                                                                                style="padding:0;Margin:0;padding-right:5px">
                                                                                <img src="https://ffeyfxm.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png"
                                                                                    alt="Fb" title="Facebook"
                                                                                    height="24" width="24"
                                                                                    style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
                                                                            </td>
                                                                            <td align="center" valign="top"
                                                                                style="padding:0;Margin:0"><img
                                                                                    src="https://ffeyfxm.stripocdn.email/content/assets/img/social-icons/logo-black/linkedin-logo-black.png"
                                                                                    alt="In" title="Linkedin"
                                                                                    height="24" width="24"
                                                                                    style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;padding-top:20px">
                                                                    <p
                                                                        style="Margin:0;mso-line-height-rule:exactly;font-family:Imprima, Arial, sans-serif;line-height:21px;letter-spacing:0;color:#2D3142;font-size:14px">
                                                                        <a target="_blank" href=""
                                                                            style="mso-line-height-rule:exactly;text-decoration:underline;color:#2D3142;font-size:14px"></a>Copyright
                                                                        © 2023&nbsp;Company<a target="_blank" href=""
                                                                            style="mso-line-height-rule:exactly;text-decoration:underline;color:#2D3142;font-size:14px"></a>
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                    cellspacing="0" role="none"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                    <tr>
                                        <td align="left" style="padding:20px;Margin:0">
                                            <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="left" style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%" role="none"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;display:none"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
    `,
  });

  if (error) {
    console.error("Error: ", error);
    throw new Error(error);
  }

  return data.id;
};

module.exports = sendMail;
