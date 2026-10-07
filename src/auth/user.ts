export type Role = 'coordinator' | 'barcoder' | 'admin';

export interface User{
    username: string;
    first_name: string;
    last_name: string;
    password_hash: string;
    role_id: number;
}