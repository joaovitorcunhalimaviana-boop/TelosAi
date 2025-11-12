import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      plan: string;
      firstLogin: boolean;
      crm?: string;
      estado?: string;
      maxPatients: number;
      basePrice: number;
      additionalPatientPrice: number;
      isLifetimePrice: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    plan: string;
    firstLogin: boolean;
    crm?: string;
    estado?: string;
    maxPatients: number;
    basePrice: number;
    additionalPatientPrice: number;
    isLifetimePrice: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    plan: string;
    firstLogin: boolean;
    crm?: string;
    estado?: string;
    maxPatients: number;
    basePrice: number;
    additionalPatientPrice: number;
    isLifetimePrice: boolean;
  }
}
