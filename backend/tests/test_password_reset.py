from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User, PasswordResetToken
from unittest.mock import patch
from django.test import override_settings
from django.core import mail


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.email = 'reset_test@example.com'
        self.user = User.objects.create_user(
            username='resetuser', email=self.email, password='initialPass123'
        )

    def test_request_password_reset_creates_token_and_returns_200(self):
        # Patch the email-sending helper to avoid external side effects
        with patch('users.views.send_password_reset_email') as mock_send:
            mock_send.return_value = True

            resp = self.client.post('/api/auth/password-reset/', {'email': self.email}, format='json')

        self.assertEqual(resp.status_code, 200)
        self.assertIn('message', resp.data)

        tokens = PasswordResetToken.objects.filter(user=self.user)
        self.assertTrue(tokens.exists(), 'PasswordResetToken should be created for the user')
        token = tokens.first()
        self.assertFalse(token.used, 'New token should not be marked used')

    def test_request_password_reset_nonexistent_email_returns_200_and_no_token(self):
        with patch('users.views.send_password_reset_email') as mock_send:
            mock_send.return_value = True

            resp = self.client.post('/api/auth/password-reset/', {'email': 'no-such@example.com'}, format='json')

        self.assertEqual(resp.status_code, 200)
        self.assertIn('message', resp.data)

        tokens = PasswordResetToken.objects.filter(user__email='no-such@example.com')
        self.assertFalse(tokens.exists(), 'No tokens should be created for non-existent email')

    def test_confirm_password_reset_changes_password_with_short_password(self):
        # Create a token for the user
        token_obj = PasswordResetToken.create_token(self.user)

        # Confirm password reset with a simple 4-char password
        resp = self.client.post('/api/auth/password-reset/confirm/', {
            'token': token_obj.token,
            'password': 'abcd',
            'password_confirm': 'abcd'
        }, format='json')

        self.assertEqual(resp.status_code, 200)
        # Refresh user from DB and check password changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('abcd'))
        # Token should be marked used
        token_obj.refresh_from_db()
        self.assertTrue(token_obj.used)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', DEFAULT_FROM_EMAIL='test@local', FRONTEND_URL='http://localhost:3000')
    def test_request_password_reset_puts_email_in_outbox(self):
        # Do not patch send_password_reset_email here; use in-memory email backend to capture sent email
        resp = self.client.post('/api/auth/password-reset/', {'email': self.email, 'frontend_url': 'http://localhost:3000'}, format='json')
        self.assertEqual(resp.status_code, 200)

        # One email should be in outbox
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertIn('Reset Your Kedah Tourism Password', message.subject)
        # Plain text body should include the reset link with token param
        self.assertIn('/reset-password?token=', message.body)
