const nodemailer = require('nodemailer');
const db = require('../config/db');

// Email transporter configuration
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

// ⭐ Send email notification
async function sendEmailNotification({ to, subject, html, text }) {
  const transport = getTransporter();

  if (!transport) {
    console.log('📧 EMAIL (logged - nodemailer not configured):');
    console.log('   To:', to);
    console.log('   Subject:', subject);
    console.log('   Body:', text?.substring(0, 200));
    return { success: false, message: 'Email logged to console (nodemailer not configured)' };
  }

  try {
    const info = await transport.sendMail({
      from: `"Smart Queue" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ⭐ Get user email by type and ID
async function getUserEmail(userType, userId) {
  return new Promise((resolve, reject) => {
    let query;
    if (userType === 'student') {
      query = 'SELECT email FROM students WHERE id = ?';
    } else if (userType === 'parent') {
      query = 'SELECT contact_value as email FROM parents WHERE id = ? AND contact_method = "email"';
    } else {
      return resolve(null);
    }

    db.query(query, [userId], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);
      resolve(results[0].email);
    });
  });
}

// ⭐ Send 3-minute warning notification
async function send3MinWarning(appointmentId, userType, userId, staffName, ticketNumber) {
  try {
    const email = await getUserEmail(userType, userId);

    if (!email) {
      console.log(`⚠️ No email found for ${userType} ${userId}, skipping email notification`);
      return { success: false, reason: 'No email on file' };
    }

    const subject = 'Smart Queue - Your Turn is Coming Soon! 🎓';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
          <h2 style="color: #667eea; margin: 0;">Smart Queue</h2>
          <p style="color: #888; margin: 5px 0;">University Appointment System</p>
        </div>

        <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
          <h3 style="color: #e65100; margin: 0 0 10px 0;">⏰ 3 Minutes Left!</h3>
          <p style="color: #bf360c; margin: 0; font-size: 14px;">Your appointment is coming up soon. Please get ready to meet with the staff.</p>
        </div>

        <div style="background: #f8f9ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="margin: 5px 0; color: #333;"><strong>Ticket Number:</strong> <span style="font-size: 24px; color: #667eea; font-weight: bold;">#${ticketNumber}</span></p>
          <p style="margin: 5px 0; color: #333;"><strong>Staff:</strong> ${staffName}</p>
          <p style="margin: 5px 0; color: #666; font-size: 13px;">Please proceed to the office now.</p>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          <p>This is an automated notification from Smart Queue.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const text = `Smart Queue - 3 Minutes Left!\n\nYour appointment is coming up soon.\nTicket: #${ticketNumber}\nStaff: ${staffName}\n\nPlease proceed to the office now.`;

    const result = await sendEmailNotification({ to: email, subject, html, text });

    // Log notification in database
    if (result.success) {
      db.query(
        `INSERT INTO notifications (appointment_id, recipient_type, recipient_id, channel, message, notification_type, is_sent, sent_at) 
         VALUES (?, ?, ?, 'email', ?, '3min_warning', 1, NOW())`,
        [appointmentId, userType, userId, `3 min warning sent to ${email}`],
        (err) => { if (err) console.error('Failed to log notification:', err); }
      );
    }

    return result;
  } catch (err) {
    console.error('3-min warning error:', err);
    return { success: false, error: err.message };
  }
}

// ⭐ Send turn now notification
async function sendTurnNowNotification(appointmentId, userType, userId, staffName, ticketNumber) {
  try {
    const email = await getUserEmail(userType, userId);

    if (!email) {
      console.log(`⚠️ No email found for ${userType} ${userId}, skipping email notification`);
      return { success: false, reason: 'No email on file' };
    }

    const subject = 'Smart Queue - It\'s Your Turn! 🎉';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
          <h2 style="color: #4caf50; margin: 0;">It\'s Your Turn!</h2>
        </div>

        <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
          <h3 style="color: #2e7d32; margin: 0 0 10px 0;">Please Enter Now</h3>
          <p style="color: #388e3c; margin: 0; font-size: 14px;">Your appointment is ready. Please proceed to the office immediately.</p>
        </div>

        <div style="background: #f8f9ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="margin: 5px 0; color: #333;"><strong>Ticket Number:</strong> <span style="font-size: 24px; color: #4caf50; font-weight: bold;">#${ticketNumber}</span></p>
          <p style="margin: 5px 0; color: #333;"><strong>Staff:</strong> ${staffName}</p>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          <p>This is an automated notification from Smart Queue.</p>
        </div>
      </div>
    `;

    const text = `Smart Queue - It\'s Your Turn!\n\nPlease enter now.\nTicket: #${ticketNumber}\nStaff: ${staffName}`;

    const result = await sendEmailNotification({ to: email, subject, html, text });

    if (result.success) {
      db.query(
        `INSERT INTO notifications (appointment_id, recipient_type, recipient_id, channel, message, notification_type, is_sent, sent_at) 
         VALUES (?, ?, ?, 'email', ?, 'turn_now', 1, NOW())`,
        [appointmentId, userType, userId, `Turn now notification sent to ${email}`],
        (err) => { if (err) console.error('Failed to log notification:', err); }
      );
    }

    return result;
  } catch (err) {
    console.error('Turn now notification error:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendEmailNotification,
  send3MinWarning,
  sendTurnNowNotification,
  getUserEmail
};