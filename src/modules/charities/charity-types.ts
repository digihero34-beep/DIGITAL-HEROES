export interface CharityEvent {
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string;
  bannerUrl?: string | null;
  websiteUrl?: string | null;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  events: CharityEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface UserCharityPreference {
  id: string;
  userId: string;
  charityId: string;
  contributionPercentage: number;
  charity?: Charity;
  createdAt: string;
  updatedAt: string;
}

export interface DirectDonationInput {
  charityId: string;
  amountCents: number;
  donorName?: string;
  donorEmail?: string;
}

export interface DirectDonationResult {
  clientSecret: string;
  donationId: string;
  amountCents: number;
  currency: string;
}
