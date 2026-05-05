export interface AppUser {
  id: string;
  created_at: Date;
  device_id: string;
  msisdn: string;
  updated_at: Date;
  user_name: string;
}

export interface StatsResponse {
  statusCode: number;
  message: {
    description?: string;
    unsubcribed_users?: AppUser[];
    [key: string]: any;
  };
}
