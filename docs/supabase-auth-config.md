# Supabase Authentication Configuration Guide

This guide will help you properly configure Supabase authentication settings to ensure that the password reset functionality works correctly.

## Required Configuration Steps

### 1. Set Site URL

The Site URL must be configured correctly to allow authentication redirects to work properly:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** > **URL Configuration**
4. Set the **Site URL** to your production URL (e.g., `https://your-domain.com`)
   - For local development, use `http://localhost:3000`

### 2. Configure Redirect URLs

Redirect URLs tell Supabase which URLs are allowed for authentication redirects:

1. Still in the **URL Configuration** section
2. Under **Redirect URLs**, add:
   - `http://localhost:3000/update-password` (for local development)
   - `https://your-domain.com/update-password` (for production)
   - Add any other domains where your app will be deployed

### 3. Enable Password Reset

Make sure password reset functionality is enabled:

1. Go to **Authentication** > **Providers**
2. Click on **Email**
3. Ensure **Enable password reset** is toggled ON

### 4. Configure Email Template

Customize the password reset email template:

1. Go to **Authentication** > **Email Templates**
2. Select the **Password Reset** template
3. Customize the template as needed (you can use the HTML from `my-app/emails/reset-password-template.html`)
4. Make sure the template includes the `{{ .ConfirmationURL }}` variable
5. Save the changes

## Troubleshooting Password Reset

If you're still experiencing issues:

### Check for URL Mismatches

The most common cause of password reset issues is URL mismatches between:

- The Site URL in Supabase
- The Redirect URLs in Supabase
- The URL used in your application code

### Check Browser Console

Look for any CORS or redirect errors in your browser's console.

### Verify Email Delivery

1. Check spam/junk folders for the reset email
2. Verify the email template is correctly formatted
3. Use a test email service like Mailtrap for development

### Common Errors

- **Invalid redirect URI**: The redirect URL in your code doesn't match the URLs configured in Supabase
- **Invalid login credentials**: The user doesn't exist or the token has expired
- **URL not allowed**: The redirect URL isn't in the list of allowed redirect URLs

## Testing the Flow Locally

To properly test the password reset flow locally:

1. Make sure `http://localhost:3000` is set as the Site URL in Supabase (for development)
2. Add `http://localhost:3000/update-password` to the Redirect URLs
3. Use a real email address that you can access for testing
4. Clear your browser's local storage and cookies before testing
5. Check your browser's console for any errors

## Production Deployment Checklist

Before deploying to production:

1. Update the Site URL to your production domain
2. Add your production domain + `/update-password` to the Redirect URLs
3. Test the flow in production with a real email address
4. Verify email deliverability in production

Remember that Supabase may have rate limits on email sending, so avoid excessive testing of the password reset functionality. 