export interface LandingFeature {
  readonly id: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly iconName: string;
  readonly badgeKey?: string;
  readonly highlight?: boolean;
  readonly bulletsKeys?: readonly string[];
}
