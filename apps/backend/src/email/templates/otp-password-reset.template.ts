export const passwordResetOtpTemplate = (params: {
  otp: string;
  expiresInMinutes: number;
}) => {
  const { otp, expiresInMinutes } = params;

  return `
  <div style="
    background-color: #f0f7ff;
    padding: 40px 20px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #333333;
  ">
    <div style="
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 82, 204, 0.08);
      overflow: hidden;
    ">

      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #0052cc 0%, #0066ff 100%);
        padding: 32px 40px;
        text-align: center;
      ">
        <h1 style="
          color: #ffffff;
          font-size: 28px;
          font-weight: 600;
          margin: 0;
          letter-spacing: 1px;
        ">
          Yash Group Dashboard
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 40px; text-align: center;">
        <h2 style="
          margin: 0 0 24px 0;
          color: #0052cc;
          font-size: 24px;
          font-weight: 600;
        ">
          Password Reset Verification Code
        </h2>

        <p style="
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 32px 0;
          color: #444444;
        ">
          Please use the one-time verification code below to reset your password for Yash Group Dashboard.
        </p>

        <div style="
          margin: 40px 0;
        ">
          <div style="
            display: inline-block;
            padding: 20px 40px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #0052cc;
            background-color: #e6f0ff;
            border-radius: 12px;
            border: 2px solid #b3d1ff;
            box-shadow: 0 4px 12px rgba(0, 82, 204, 0.1);
          ">
            ${otp}
          </div>
        </div>

        <p style="
          font-size: 15px;
          line-height: 1.6;
          color: #444444;
          margin: 0 0 16px 0;
        ">
          This code is valid for <strong style="color: #0052cc;">${expiresInMinutes} minutes</strong>.
        </p>

        <p style="
          font-size: 15px;
          line-height: 1.6;
          color: #666666;
          margin: 0 0 24px 0;
        ">
          For security reasons, please do not share this code with anyone.
        </p>

        <p style="
          font-size: 15px;
          line-height: 1.6;
          color: #666666;
          margin: 0;
        ">
          If you didn't request this code, please ignore this email or contact support if you're concerned about account security.
        </p>
      </div>

      <!-- Footer -->
      <div style="
        background-color: #f0f7ff;
        padding: 24px;
        font-size: 13px;
        color: #666666;
        text-align: center;
        border-top: 1px solid #d9e6ff;
      ">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #0052cc;">
          Yash Group Dashboard
        </p>
        <p style="margin: 0; font-size: 12px;">
          This is an automated message — please do not reply to this email.<br>
          © ${new Date().getFullYear()} Yash Group. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `;
};
