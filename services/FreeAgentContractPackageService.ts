export interface GuaranteedContractPackageAllocation {
  annualSalary: number;
  signingBonus: number;
  guaranteedTotal: number;
}

interface GuaranteedContractPackageLimits {
  years: number;
  maxAnnualSalary: number;
  maxSigningBonus: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const wholeMoney = (value: number): number =>
  Math.max(0, Math.round(Number.isFinite(value) ? value : 0));

/*
 * A free-agent offer has one guaranteed package:
 *
 *   guaranteed total = annual salary * contract years + signing bonus
 *
 * Salary and signing bonus are therefore allocations of the same money, not two
 * unrelated offer sliders. These pure helpers preserve that total while the user
 * moves either component. Performance bonuses are deliberately excluded because
 * they are conditional and must remain independent negotiation incentives.
 */
const allocateByPreferredSalary = (
  requestedTotal: number,
  preferredAnnualSalary: number,
  limits: GuaranteedContractPackageLimits,
): GuaranteedContractPackageAllocation => {
  const years = Math.max(1, Math.round(limits.years));
  const maxAnnualSalary = wholeMoney(limits.maxAnnualSalary);
  const maxSigningBonus = wholeMoney(limits.maxSigningBonus);
  const maximumRepresentableTotal = maxAnnualSalary * years + maxSigningBonus;
  const guaranteedTotal = clamp(wholeMoney(requestedTotal), 0, maximumRepresentableTotal);

  // The salary must leave a signing bonus between zero and its OVR/club limit.
  const minimumSalaryForTotal = Math.max(0, Math.ceil((guaranteedTotal - maxSigningBonus) / years));
  const maximumSalaryForTotal = Math.min(maxAnnualSalary, Math.floor(guaranteedTotal / years));
  const annualSalary = clamp(
    wholeMoney(preferredAnnualSalary),
    minimumSalaryForTotal,
    Math.max(minimumSalaryForTotal, maximumSalaryForTotal),
  );
  const signingBonus = guaranteedTotal - annualSalary * years;

  return { annualSalary, signingBonus, guaranteedTotal };
};

export const FreeAgentContractPackageService = {
  calculateTotal(annualSalary: number, years: number, signingBonus: number): number {
    return wholeMoney(annualSalary) * Math.max(1, Math.round(years)) + wholeMoney(signingBonus);
  },

  /* Change the package value while preserving the current salary where possible. */
  allocateTotal(
    guaranteedTotal: number,
    preferredAnnualSalary: number,
    limits: GuaranteedContractPackageLimits,
  ): GuaranteedContractPackageAllocation {
    return allocateByPreferredSalary(guaranteedTotal, preferredAnnualSalary, limits);
  },

  /* Raising annual salary automatically removes `salary delta * years` from the bonus. */
  allocateSalary(
    guaranteedTotal: number,
    requestedAnnualSalary: number,
    limits: GuaranteedContractPackageLimits,
  ): GuaranteedContractPackageAllocation {
    return allocateByPreferredSalary(guaranteedTotal, requestedAnnualSalary, limits);
  },

  /* Raising the signing bonus spends the same pool and therefore lowers annual salary. */
  allocateBonus(
    guaranteedTotal: number,
    requestedSigningBonus: number,
    limits: GuaranteedContractPackageLimits,
  ): GuaranteedContractPackageAllocation {
    const years = Math.max(1, Math.round(limits.years));
    const signingBonus = clamp(
      wholeMoney(requestedSigningBonus),
      0,
      Math.min(wholeMoney(limits.maxSigningBonus), wholeMoney(guaranteedTotal)),
    );
    const preferredAnnualSalary = Math.round((wholeMoney(guaranteedTotal) - signingBonus) / years);
    return allocateByPreferredSalary(guaranteedTotal, preferredAnnualSalary, limits);
  },
};
