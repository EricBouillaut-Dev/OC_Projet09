/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // On vérifie que la classe "active-icon" est présente dans l'élément contenant data-testid="icon-window"
      await waitFor(() => screen.getByTestId("icon-window"));
      const iconWindow = screen.getByTestId("icon-window");
      expect(iconWindow.classList.contains("active-icon")).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When clicking on an eye icon", () => {
		test("Then, modal should open and have a title and a file url", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			document.body.innerHTML = BillsUI({ data: bills });
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

			const modale = document.getElementById("modaleFile");
			$.fn.modal = jest.fn(() => modale.classList.add("show"));

			const eye = screen.getAllByTestId("icon-eye")[0];
			const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye));

			eye.addEventListener("click", handleClickIconEye);
			userEvent.click(eye);
			expect(handleClickIconEye).toHaveBeenCalled();

			expect(modale.classList).toContain("show");

			expect(screen.getByText("Justificatif")).toBeTruthy();
			expect(bills[0].fileUrl).toBeTruthy();
		});
	});

  describe("When I am on Bills Page and I click on the new bill button", () => {
    test("Then I should be send on the new bill page form", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = BillsUI({ data: bills });

      const allBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorageMock,
      });

      const handleClickNewBill = jest.fn(() => allBills.handleClickNewBill());

      const btnNewBill = screen.getByTestId("btn-new-bill");
      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    });
  });
});

// test d'intégration GET et messages d'erreurs 404 et 500
describe("Given I am a user connected as Employee", () => {
	describe("When I navigate to Bill", () => {
		beforeEach(() => {
			jest.spyOn(mockStore, "bills");
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
					email: "a@a",
				})
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.appendChild(root);
			router();
		});
		test("Then, fetches bills from mock API GET", async () => {
			window.onNavigate(ROUTES_PATH.Bills);
			expect(screen.getAllByText("Billed")).toBeTruthy();
			expect(await waitFor(() => screen.getByText("Mes notes de frais"))).toBeTruthy();
			expect(screen.getByTestId("tbody")).toBeTruthy();
			expect(screen.getAllByText("test1")).toBeTruthy();
		});

		test("Then, fetches bills from an API and fails with 404 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 404"));
					},
				};
			});
			window.onNavigate(ROUTES_PATH.Bills);
			await new Promise(process.nextTick);
			const message = await screen.getByText(/Erreur 404/);
			expect(message).toBeTruthy();
		});

		test("Then, fetches messages from an API and fails with 500 message error", async () => {
			mockStore.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error("Erreur 500"));
					},
				};
			});
			window.onNavigate(ROUTES_PATH.Bills);
			await new Promise(process.nextTick);
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
	});
});
