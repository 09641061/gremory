import { PlanId } from "../value-objects/plan-id";

export class Plan {
  constructor(
    public readonly id: PlanId,
    public readonly name: string,
    public readonly description: string,
    public readonly maxEstablishments: number, // 1 for Standard, -1 for Unlimited (Premium)
    public readonly features: readonly string[],
    public readonly isPopular: boolean = false
  ) {
    if (!name.trim()) throw new Error("Plan name is required");
  }

  public isUnlimitedEstablishments(): boolean {
    return this.maxEstablishments === -1;
  }
}
