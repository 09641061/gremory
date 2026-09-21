export interface LandingTestimonial {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
  readonly avatarUrl?: string;
  readonly rating: number;
  readonly quoteKey: string;
  readonly metricKey: string;
  readonly metricLabelKey?: string;
}
