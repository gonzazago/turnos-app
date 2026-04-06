export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class GoogleCalendarService {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  }

  async exchangeAuthorizationCode(code: string, redirectUri: string): Promise<GoogleTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        access_type: 'offline', // Ensure we get a refresh token
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to exchange Google code:', data);
      throw new Error('Failed to exchange Google authorization code');
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    };
  }

  async refreshToken(refreshToken: string): Promise<GoogleTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to refresh Google token:', data);
      throw new Error('Failed to refresh Google token');
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken, // Refresh token might not be returned if still valid
      expires_in: data.expires_in,
    };
  }
}
