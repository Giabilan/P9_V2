/**
 * @jest-environment jsdom
 *
 * Tests d'intégration complémentaires pour Bills.js
 * (fichier séparé : les tests OC d'origine ne sont pas modifiés)
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../pages/Bills/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { getBills, initBillsPage } from "../pages/Bills/Bills.js";
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

describe("Bills — couverture complémentaire", () => {
  describe("When I am on Bills page and I click new bill", () => {
    test("Then I should be redirected to NewBill page", () => {
      setupEmployeeLocalStorage();
      document.body.innerHTML = BillsUI({ data: bills });
      initBillsPage({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      fireEvent.click(screen.getByTestId("btn-new-bill"));
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("When I click on the icon eye", () => {
    test("Then a modal should open", () => {
      setupEmployeeLocalStorage();
      document.body.innerHTML = BillsUI({ data: bills });
      initBillsPage({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const showMock = jest.fn();
      global.bootstrap = {
        Modal: jest.fn().mockImplementation(() => ({ show: showMock })),
      };

      fireEvent.click(screen.getAllByTestId("icon-eye")[0]);
      expect(document.querySelector("#modaleFile")).toBeTruthy();
      expect(global.bootstrap.Modal).toHaveBeenCalled();
      expect(showMock).toHaveBeenCalled();
    });
  });

  describe("getBills", () => {
    test("Then it returns bills sorted from latest to earliest", async () => {
      const result = await getBills(mockStore);
      expect(result.length).toBe(4);
      expect(result[0].name).toBe("encore");
      expect(result[result.length - 1].name).toBe("test1");
    });

    test("Then it returns an empty array when store is null", async () => {
      expect(await getBills(null)).toEqual([]);
    });

    test("Then it throws when the API fails", async () => {
      const errorStore = {
        bills: () => ({
          list: () => Promise.reject(new Error("Erreur 404")),
        }),
      };
      await expect(getBills(errorStore)).rejects.toThrow("Erreur 404");
    });
  });

  describe("When I navigate to Bills (integration GET)", () => {
    test("fetches bills from mock API GET", async () => {
      setupEmployeeLocalStorage();
      document.body.innerHTML = "";
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("tbody")).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      setupEmployeeLocalStorage();
      document.body.innerHTML = "";
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error("Erreur 404")),
      }));
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText(/Erreur 404/));
      expect(screen.getByText(/Erreur 404/)).toBeTruthy();
    });

    test("fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.reject(new Error("Erreur 500")),
      }));
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText(/Erreur 500/));
      expect(screen.getByText(/Erreur 500/)).toBeTruthy();
    });
  });
});
