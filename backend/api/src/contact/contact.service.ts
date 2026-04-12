import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { dbPool } from '../lib/db';
import { sendTransactionalEmail } from '../lib/transactional-email';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  async submitContact(
    contactDto: ContactDto,
  ): Promise<{ message: string; success: boolean }> {
    const id = randomUUID();

    // Save to database using raw SQL
    await dbPool.query(
      `INSERT INTO contact_submissions (id, name, email, subject, category, message, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        id,
        contactDto.name,
        contactDto.email,
        contactDto.subject,
        contactDto.category,
        contactDto.message,
      ],
    );

    // Forward email to configured email
    const contactEmail = process.env.CONTACT_EMAIL || 'ekumamatthew1@gmail.com';

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="color:#333">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactDto.name}</p>
        <p><strong>Email:</strong> ${contactDto.email}</p>
        <p><strong>Category:</strong> ${contactDto.category || 'N/A'}</p>
        <p><strong>Subject:</strong> ${contactDto.subject}</p>
        <hr style="margin:20px 0;border:0;border-top:1px solid #eee">
        <p><strong>Message:</strong></p>
        <p style="background:#f5f5f5;padding:15px;border-radius:5px">${contactDto.message}</p>
      </div>
    `;

    const text = `
      New Contact Form Submission

      Name: ${contactDto.name}
      Email: ${contactDto.email}
      Category: ${contactDto.category || 'N/A'}
      Subject: ${contactDto.subject}

      Message:
      ${contactDto.message}
    `;

    try {
      await sendTransactionalEmail({
        to: contactEmail,
        subject: `Contact Form: ${contactDto.subject}`,
        html,
        text,
        tags: [{ name: 'contact-form', value: 'submission' }],
      });
      console.log('Contact submission forwarded to:', contactEmail);
    } catch (error) {
      console.error('Failed to forward email:', error);
      // Don't fail the submission if email fails
    }

    console.log('Contact submission saved to DB:', {
      email: contactDto.email,
      subject: contactDto.subject,
      id: id,
    });

    return {
      message: 'Contact form submitted successfully',
      success: true,
    };
  }
}
