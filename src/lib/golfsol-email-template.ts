export const golfSolEmailSubject = 'Your Costa del Sol golf trip plan is ready'

export const golfSolEmailPreviewText =
  'A premium GolfSol Ireland itinerary snapshot with transfers, tee times, accommodation and next steps.'

const brand = {
  green: '#063B2A',
  greenSoft: '#0F513C',
  gold: '#FFC72C',
  goldDeep: '#D99A00',
  cream: '#F7F0E2',
  sand: '#E9D9B6',
  ink: '#16231D',
  muted: '#66736D',
  white: '#FFFFFF'
} as const

const assets = {
  logo: '/images/golfsol-header-logo-bitmap.png',
  fleetLineup: '/images/transport-fleet-lineup.jpg',
  arrivals: '/images/transport-moment-arrivals.jpg',
  resort: '/images/transport-moment-resort.jpg',
  coastalDrive: '/images/transport-hero-coastal-drive.jpg'
} as const

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function getGolfSolBrandedEmailHtml() {
  const subject = escapeHtml(golfSolEmailSubject)
  const preview = escapeHtml(golfSolEmailPreviewText)

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${subject}</title>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            <o:AllowPNG/>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <style>
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
      a { text-decoration: none; }
      .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide: all; }

      @media screen and (max-width: 680px) {
        .email-shell { width: 100% !important; }
        .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .mobile-stack { display: block !important; width: 100% !important; }
        .mobile-center { text-align: center !important; }
        .hero-title { font-size: 34px !important; line-height: 38px !important; }
        .section-title { font-size: 24px !important; line-height: 30px !important; }
        .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:${brand.cream};">
    <div class="preheader">${preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
    <center role="article" aria-roledescription="email" lang="en" style="width:100%; background:${brand.cream};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.cream};">
        <tr>
          <td align="center" style="padding:32px 12px;">
            <table role="presentation" class="email-shell" width="640" cellpadding="0" cellspacing="0" style="width:640px; max-width:640px;">
              <tr>
                <td style="padding:0 0 14px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="mobile-center" style="font-family:Arial, Helvetica, sans-serif; color:${brand.green}; font-size:12px; line-height:18px; font-weight:800; letter-spacing:2.4px; text-transform:uppercase;">
                        Irish-owned · Costa del Sol Golf Specialists
                      </td>
                      <td class="mobile-center" align="right" style="font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:12px; line-height:18px;">
                        GolfSol Ireland
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="border-radius:30px; overflow:hidden; background:${brand.green}; box-shadow:0 28px 80px rgba(6,59,42,0.22);">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="mobile-pad" style="padding:34px 38px 28px 38px; background:${brand.green};">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                          <tr>
                            <td class="mobile-center" align="left" style="vertical-align:middle;">
                              <img src="${assets.logo}" width="220" height="107" alt="GolfSol Ireland" style="display:block; width:220px; max-width:76%; height:auto; margin:0; border:0;">
                            </td>
                            <td class="mobile-center" align="right" style="vertical-align:middle; font-family:Arial, Helvetica, sans-serif; color:${brand.gold}; font-size:11px; line-height:15px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase;">
                              Premium golf travel
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="mobile-stack" style="width:62%; vertical-align:top;">
                              <div style="display:inline-block; border:1px solid rgba(255,199,44,0.55); border-radius:999px; padding:8px 12px; font-family:Arial, Helvetica, sans-serif; color:${brand.gold}; font-size:11px; line-height:14px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase;">
                                Trip plan ready
                              </div>
                              <h1 class="hero-title" style="margin:18px 0 0 0; font-family:Georgia, 'Times New Roman', serif; color:${brand.white}; font-size:43px; line-height:48px; font-weight:700; letter-spacing:-1.2px;">
                                Your golf escape is taking shape.
                              </h1>
                              <p style="margin:16px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:#DCE8E2; font-size:17px; line-height:27px;">
                                We have pulled together the first GolfSol Ireland snapshot for your Costa del Sol trip: airport transfer, resort base, tee-time direction and next steps.
                              </p>
                            </td>
                            <td class="mobile-stack" style="width:38%; vertical-align:top; padding-left:22px;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B4935; border:1px solid rgba(255,199,44,0.32); border-radius:22px;">
                                <tr>
                                  <td style="padding:18px;">
                                    <p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.gold}; font-size:11px; line-height:14px; font-weight:800; letter-spacing:1.6px; text-transform:uppercase;">Now boarding</p>
                                    <p style="margin:10px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.white}; font-size:24px; line-height:28px; font-weight:800;">Malaga Airport</p>
                                    <p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:#CFE0D8; font-size:13px; line-height:20px;">Meet & greet transfer with golf-bag room reserved.</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="height:5px; line-height:5px; background:${brand.gold}; font-size:0;">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.white}; border:1px solid ${brand.sand}; border-radius:26px; overflow:hidden;">
                    <tr>
                      <td style="padding:0;">
                        <img src="${assets.fleetLineup}" width="640" height="359" alt="GolfSol Ireland Mercedes fleet lineup for Costa del Sol golf transfers." style="display:block; width:100%; max-width:640px; height:auto; border:0;">
                      </td>
                    </tr>
                    <tr>
                      <td class="mobile-pad" style="padding:18px 24px 22px 24px; background:#FFF9EA;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="mobile-stack" style="vertical-align:top;">
                              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.goldDeep}; font-size:11px; line-height:15px; font-weight:900; letter-spacing:1.7px; text-transform:uppercase;">Golf-bag friendly Mercedes fleet</p>
                              <p style="margin:8px 0 0 0; font-family:Georgia, 'Times New Roman', serif; color:${brand.ink}; font-size:24px; line-height:30px; font-weight:700;">E-Class, V-Class and Sprinter options matched to your group.</p>
                            </td>
                            <td class="mobile-stack" align="right" style="vertical-align:top; padding-left:18px;">
                              <p style="margin:3px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:14px; line-height:22px;">Private transfers from Malaga Airport to resort, tee times and return departures.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.white}; border:1px solid ${brand.sand}; border-radius:26px;">
                    <tr>
                      <td class="mobile-pad" style="padding:28px 34px;">
                        <h2 class="section-title" style="margin:0; font-family:Georgia, 'Times New Roman', serif; color:${brand.ink}; font-size:28px; line-height:34px; letter-spacing:-0.4px;">Recommended itinerary snapshot</h2>
                        <p style="margin:10px 0 22px 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:15px; line-height:24px;">A polished starting point for your group. We can tune every part before anything is confirmed.</p>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="mobile-stack" style="width:50%; padding:0 8px 12px 0;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9EA; border:1px solid #F0DFB7; border-radius:18px;">
                                <tr><td style="padding:18px;"><p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.goldDeep}; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase;">Transfer</p><p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.ink}; font-size:17px; line-height:23px; font-weight:800;">Private AGP pickup</p><p style="margin:6px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:13px; line-height:20px;">Driver tracked to your flight, with vehicle matched to bag count.</p></td></tr>
                              </table>
                            </td>
                            <td class="mobile-stack" style="width:50%; padding:0 0 12px 8px;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6FBF8; border:1px solid #DCECE5; border-radius:18px;">
                                <tr><td style="padding:18px;"><p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.greenSoft}; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase;">Stay</p><p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.ink}; font-size:17px; line-height:23px; font-weight:800;">Golf-friendly resort base</p><p style="margin:6px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:13px; line-height:20px;">Curated for access to Fuengirola, Marbella and nearby courses.</p></td></tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td class="mobile-stack" style="width:50%; padding:0 8px 0 0;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6FBF8; border:1px solid #DCECE5; border-radius:18px;">
                                <tr><td style="padding:18px;"><p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.greenSoft}; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase;">Golf</p><p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.ink}; font-size:17px; line-height:23px; font-weight:800;">2-3 preferred rounds</p><p style="margin:6px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:13px; line-height:20px;">Courses selected around ability, transfer time and daylight.</p></td></tr>
                              </table>
                            </td>
                            <td class="mobile-stack" style="width:50%; padding:0 0 0 8px;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9EA; border:1px solid #F0DFB7; border-radius:18px;">
                                <tr><td style="padding:18px;"><p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.goldDeep}; font-size:11px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase;">Support</p><p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.ink}; font-size:17px; line-height:23px; font-weight:800;">Irish phone line</p><p style="margin:6px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:13px; line-height:20px;">WhatsApp-friendly follow-up from a real person.</p></td></tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.white}; border:1px solid ${brand.sand}; border-radius:26px;">
                    <tr>
                      <td class="mobile-pad" style="padding:28px 34px;">
                        <p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.greenSoft}; font-size:11px; line-height:15px; font-weight:900; letter-spacing:1.7px; text-transform:uppercase;">Transfer experience</p>
                        <h2 class="section-title" style="margin:8px 0 18px 0; font-family:Georgia, 'Times New Roman', serif; color:${brand.ink}; font-size:28px; line-height:34px; letter-spacing:-0.4px;">From arrivals hall to resort door.</h2>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td class="mobile-stack" style="width:33.33%; padding:0 7px 0 0; vertical-align:top;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6FBF8; border:1px solid #DCECE5; border-radius:18px; overflow:hidden;">
                                <tr><td><img src="${assets.arrivals}" width="190" height="107" alt="Meet and greet at Malaga Airport arrivals." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:13px;"><p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.ink}; font-size:14px; line-height:19px; font-weight:800;">Arrivals tracked</p><p style="margin:5px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:12px; line-height:18px;">Driver ready when your flight lands.</p></td></tr>
                              </table>
                            </td>
                            <td class="mobile-stack" style="width:33.33%; padding:0 3.5px; vertical-align:top;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF9EA; border:1px solid #F0DFB7; border-radius:18px; overflow:hidden;">
                                <tr><td><img src="${assets.resort}" width="190" height="107" alt="GolfSol transfer van arriving at a Costa del Sol golf resort." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:13px;"><p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.ink}; font-size:14px; line-height:19px; font-weight:800;">Resort drop-off</p><p style="margin:5px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:12px; line-height:18px;">Straight to hotel, villa or course.</p></td></tr>
                              </table>
                            </td>
                            <td class="mobile-stack" style="width:33.33%; padding:0 0 0 7px; vertical-align:top;">
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6FBF8; border:1px solid #DCECE5; border-radius:18px; overflow:hidden;">
                                <tr><td><img src="${assets.coastalDrive}" width="190" height="107" alt="Premium transfer van driving along the Costa del Sol coastline." style="display:block; width:100%; height:auto; border:0;"></td></tr>
                                <tr><td style="padding:13px;"><p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.ink}; font-size:14px; line-height:19px; font-weight:800;">Sol corridor</p><p style="margin:5px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:12px; line-height:18px;">Malaga, Marbella and beyond.</p></td></tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.green}; border-radius:26px;">
                    <tr>
                      <td class="mobile-pad mobile-center" style="padding:28px 34px;">
                        <p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.gold}; font-size:12px; line-height:16px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase;">Next step</p>
                        <h2 style="margin:9px 0 0 0; font-family:Georgia, 'Times New Roman', serif; color:${brand.white}; font-size:28px; line-height:34px;">Tell us what to tune.</h2>
                        <p style="margin:10px 0 22px 0; font-family:Arial, Helvetica, sans-serif; color:#DCE8E2; font-size:15px; line-height:24px;">Reply with your preferred dates, group size and any must-play courses. We will shape the quote around the group rather than forcing you into a fixed package.</p>
                        <a class="cta-button" href="https://golfsolirl.com/#quote" style="display:inline-block; border-radius:999px; background:${brand.gold}; color:${brand.ink}; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:18px; font-weight:900; letter-spacing:1.4px; text-transform:uppercase; padding:16px 24px;">
                          Get my quote refined
                        </a>
                        <p style="margin:18px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:#CFE0D8; font-size:14px; line-height:22px;">Prefer to call? <a href="tel:+353874464766" style="color:${brand.gold}; font-weight:800;">+353 87 446 4766</a></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td class="mobile-pad" style="padding:22px 34px 0 34px;">
                  <p style="margin:0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:12px; line-height:20px; text-align:center;">
                    GolfSol Ireland · Irish-owned Costa del Sol golf travel · Transfers, accommodation and tee times in one place.
                  </p>
                  <p style="margin:8px 0 0 0; font-family:Arial, Helvetica, sans-serif; color:${brand.muted}; font-size:11px; line-height:18px; text-align:center;">
                    You are receiving this because you requested GolfSol Ireland trip information. If this was not you, ignore this message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>`
}
