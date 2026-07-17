/**
 * @jest-environment jsdom
 *
 * Tests d'intégration complémentaires pour NewBill.js
 * (fichier séparé : les tests OC d'origine ne sont pas modifiés)
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../pages/NewBill/NewBillUI.js";
import {
  initNewBillPage,
  resetBillFileState,
} from "../pages/NewBill/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

const setupEmployeeLocalStorage = () => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
  window.localStorage.clear();
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "employee@test.tld",
    }),
  );
};

const uploadFile = (fileInput, fileName, type = "image/jpeg") => {
  const file = new File(["content"], fileName, { type });
  Object.defineProperty(fileInput, "files", {
    value: [file],
    configurable: true,
  });
  fireEvent.change(fileInput);
};

describe("NewBill — couverture complémentaire", () => {
  beforeEach(() => {
    setupEmployeeLocalStorage();
    resetBillFileState();
    document.body.innerHTML = NewBillUI();
    initNewBillPage({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
  });

  describe("When I upload a file with an invalid format", () => {
    test("Then the file should not be uploaded to the store", () => {
      const createSpy = jest.spyOn(mockStore.bills(), "create");
      uploadFile(screen.getByTestId("file"), "facture.pdf", "application/pdf");
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe("When I upload a file with a valid format", () => {
    test("Then the file should be uploaded to the store", async () => {
      const createSpy = jest.spyOn(mockStore.bills(), "create");
      uploadFile(screen.getByTestId("file"), "facture.jpg");
      await waitFor(() => expect(createSpy).toHaveBeenCalled());
    });
  });

  describe("When I fill the form and submit", () => {
    test("Then the bill should be updated and I should see Bills page", async () => {
      uploadFile(screen.getByTestId("file"), "facture.png", "image/png");
      await waitFor(() => {
        expect(mockStore.bills().create).toHaveBeenCalled();
      });

      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Transports" },
      });
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Vol Paris Londres" },
      });
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2024-01-15" },
      });
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "348" },
      });
      fireEvent.change(screen.getByTestId("vat"), { target: { value: "70" } });
      fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
      fireEvent.change(screen.getByTestId("commentary"), {
        target: { value: "Déplacement pro" },
      });

      const updateSpy = jest.spyOn(mockStore.bills(), "update");
      fireEvent.submit(screen.getByTestId("form-new-bill"));

      await waitFor(() => expect(updateSpy).toHaveBeenCalled());
      await waitFor(() =>
        expect(screen.getByText("Mes notes de frais")).toBeTruthy(),
      );
    });
  });

  describe("When I upload a file and the API fails", () => {
    test("Then the error should be handled", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      jest
        .spyOn(mockStore.bills(), "create")
        .mockRejectedValueOnce(new Error("Erreur 500"));

      uploadFile(screen.getByTestId("file"), "facture.jpeg");
      await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
      consoleSpy.mockRestore();
    });
  });
});

describe("NewBill — navigation", () => {
  test("Then the NewBill form should be displayed via router", async () => {
    setupEmployeeLocalStorage();
    resetBillFileState();
    document.body.innerHTML = "";
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
    await waitFor(() => screen.getByTestId("form-new-bill"));
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
});
