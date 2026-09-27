export type CreateCleanerInput = {
  username: string;
  email: string;
  phone_number: string;
  cleaner_status: "active" | "inactive";
};

export type CreateUserData = {
  username: string;
  email: string;
  phone_number: string;
  cleaner_status: "active" | "inactive";

  role: "cleaner";
  password_hash: string;
  password_changed_at: null;
};

export type CleanerResponse = {
  userId: string;
  username: string;
  role: "cleaner";
  email: string;
  email_verified: boolean;
  phone_number: string;
  profile_image: string | null;
  cleaner_status: "active" | "inactive";

  stats: {
    assigned_sessions: number;
    cash_to_collect: number;
  };

  created_at: Date;
  updated_at: Date;
};