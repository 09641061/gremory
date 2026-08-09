import "server-only";

import { apiConfig } from "@/api.config";

type OrganizationImageUploadResponse = {
  message?: string;
};

export class OrganizationImageUploadService {
  async upload(organizationId: string, name: string, photoFile: File, token: string): Promise<void> {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("photoFile", photoFile);

    const response = await fetch(
      `${apiConfig.baseUrl}${apiConfig.routes.organizations}/${encodeURIComponent(organizationId)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as OrganizationImageUploadResponse | null;
      throw new Error(data?.message || "Failed to update organization");
    }
  }
}

export function createOrganizationImageUploadService() {
  return new OrganizationImageUploadService();
}
