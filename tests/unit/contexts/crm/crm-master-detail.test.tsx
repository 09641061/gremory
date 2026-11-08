/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { CrmMasterDetailView } from "@/contexts/crm/interfaces/components/customer-directory/crm-master-detail-view";
import type { CustomerResponse } from "@/contexts/crm/application/models/customer";

vi.mock("@/contexts/crm/interfaces/actions/get-customer-overview.action", () => ({
  getCustomerOverviewAction: vi.fn().mockResolvedValue({
    status: "success",
    data: {
      customer: {
        id: "cust-1",
        name: "Ana Morales",
        documentType: "DNI",
        documentNumber: "46027897",
        phone: "+51987654321",
        email: "ana@example.com",
        notes: "Prefiere té de manzanilla",
      },
      appointments: {
        totalAppointments: 5,
        completedAppointments: 4,
        noShowCount: 1,
        lastOrNextVisitAt: "2026-10-25T15:00:00Z",
        recentAppointments: [
          {
            id: "app-1",
            serviceName: "Masaje Relajante",
            employeeName: "Diego",
            startsAt: "2026-10-25T15:00:00Z",
            endsAt: "2026-10-25T16:00:00Z",
            status: "CONFIRMED",
          },
        ],
      },
      whatsappConversationId: "conv-1",
    },
  }),
}));

vi.mock("@/contexts/crm/interfaces/actions/update-customer-notes.action", () => ({
  updateCustomerNotesAction: vi.fn().mockResolvedValue({
    status: "success",
    data: {
      id: "cust-1",
      notes: "Notas actualizadas",
    },
  }),
}));

const mockCustomers: CustomerResponse[] = [
  {
    id: "cust-1",
    organizationId: "org-1",
    establishmentId: "est-1",
    documentType: "DNI",
    documentNumber: "46027897",
    name: "Ana Morales",
    phone: "+51987654321",
    email: "ana@example.com",
    notes: "Prefiere té de manzanilla",
  },
  {
    id: "cust-2",
    organizationId: "org-1",
    establishmentId: "est-1",
    documentType: "DNI",
    documentNumber: "12345678",
    name: "Carlos Ruiz",
    phone: "+51999888777",
    email: "carlos@example.com",
  },
];

describe("CrmMasterDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render customer list and display selected customer details", async () => {
    const handleSelect = vi.fn();
    const handleOpenWhatsapp = vi.fn();
    const handleSearch = vi.fn();

    render(
      <CrmMasterDetailView
        customers={mockCustomers}
        establishmentId="est-1"
        selectedCustomerId="cust-1"
        onSelectCustomer={handleSelect}
        onOpenWhatsapp={handleOpenWhatsapp}
        searchTerm=""
        onSearchChange={handleSearch}
      />,
    );

    expect(screen.getAllByText("Ana Morales").length).toBeGreaterThan(0);
    expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument();

    // Verify KPI cards rendered
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument(); // total appointments
      expect(screen.getByText("Masaje Relajante")).toBeInTheDocument();
    });
  });

  it("should trigger open whatsapp when button is clicked", async () => {
    const handleOpenWhatsapp = vi.fn();

    render(
      <CrmMasterDetailView
        customers={mockCustomers}
        establishmentId="est-1"
        selectedCustomerId="cust-1"
        onSelectCustomer={vi.fn()}
        onOpenWhatsapp={handleOpenWhatsapp}
        searchTerm=""
        onSearchChange={vi.fn()}
      />,
    );

    const openWaBtn = screen.getByRole("button", { name: /Abrir chat de WhatsApp|Open WhatsApp Chat/i });
    fireEvent.click(openWaBtn);

    expect(handleOpenWhatsapp).toHaveBeenCalledWith("cust-1");
  });

  it("should allow editing and saving notes", async () => {
    render(
      <CrmMasterDetailView
        customers={mockCustomers}
        establishmentId="est-1"
        selectedCustomerId="cust-1"
        onSelectCustomer={vi.fn()}
        onOpenWhatsapp={vi.fn()}
        searchTerm=""
        onSearchChange={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText(/Preferencias del cliente|Customer preferences/i);
    fireEvent.change(textarea, { target: { value: "Alérgica a perfume cítrico" } });

    const saveBtn = screen.getByRole("button", { name: /Guardar notas|Save Notes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Notas guardadas|Notes saved/i)).toBeInTheDocument();
    });
  });

  it("should render placeholder when customer email is null (e.g. WhatsApp customer)", async () => {
    const whatsappCustomer: CustomerResponse = {
      id: "cust-wa",
      organizationId: "org-1",
      establishmentId: "est-1",
      documentType: "DNI",
      documentNumber: "87654321",
      name: "WhatsApp User",
      phone: "+51912345678",
      email: null,
    };

    render(
      <CrmMasterDetailView
        customers={[whatsappCustomer]}
        establishmentId="est-1"
        selectedCustomerId="cust-wa"
        onSelectCustomer={vi.fn()}
        onOpenWhatsapp={vi.fn()}
        searchTerm=""
        onSearchChange={vi.fn()}
      />,
    );

    expect(screen.getAllByText("WhatsApp User").length).toBeGreaterThan(0);
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });
});
