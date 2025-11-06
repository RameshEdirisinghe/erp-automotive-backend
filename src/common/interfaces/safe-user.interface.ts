
export interface SafeUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}
