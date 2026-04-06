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

  async createEvent(accessToken: string, event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees: { email: string }[];
    conferenceData?: any;
  }) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        conferenceData: event.conferenceData ? {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        } : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to create Google event:', data);
      throw new Error('Failed to create Google Calendar event');
    }

    return data;
  }

  async deleteEvent(accessToken: string, eventId: string) {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Failed to delete Google event:', data);
      throw new Error('Failed to delete Google Calendar event');
    }

    return true;
  }

  async subscribeToCalendar(accessToken: string, callbackUrl: string) {
    const channelId = crypto.randomUUID();
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: callbackUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to subscribe to Google Calendar:', data);
      throw new Error('Failed to subscribe to Google Calendar webhooks');
    }

    return {
      webhook_id: data.id,
      webhook_resource_id: data.resourceId,
      webhook_expiration: new Date(parseInt(data.expiration)).toISOString(),
    };
  }

  async unsubscribeFromCalendar(accessToken: string, webhookId: string, resourceId: string) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/channels/stop', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: webhookId,
        resourceId: resourceId,
      }),
    });

    if (!response.ok && response.status !== 404) {
      const data = await response.json();
      console.error('Failed to unsubscribe from Google Calendar:', data);
      throw new Error('Failed to unsubscribe from Google Calendar webhooks');
    }

    return true;
  }
}
