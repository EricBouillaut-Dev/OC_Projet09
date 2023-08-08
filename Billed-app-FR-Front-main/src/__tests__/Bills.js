/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an Employee", () => {
  // Tests pour BillsUI.js
  describe("When I am on the Bills page and there is a bill icon in vertical layout", () => {
    test("Then the icon should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      const isIconActivated = windowIcon.classList.contains("active-icon");
      expect(isIconActivated).toBeTruthy();
    });
  });

  describe("When I am on the Bills page and there is a title and a newBill button", () => {
    test("Then the title and the button should be rendered correctly", () => {
      document.body.innerHTML = BillsUI({ data: [] });
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });
  });

  describe("When I am on the Bills page and there are 4 bills", () => {
    test("Then the bills data should be rendered with type, name, date, amount, status, and eye icon", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const bill = screen.getAllByTestId("bill");
      const type = screen.getAllByTestId("type");
      const name = screen.getAllByTestId("name");
      const date = screen.getAllByTestId("date");
      const amount = screen.getAllByTestId("amount");
      const status = screen.getAllByTestId("status");
      const iconEye = screen.getAllByTestId("icon-eye");

      expect(bill.length).toBe(4);
      expect(type.length).toBe(4);
      expect(name.length).toBe(4);
      expect(date.length).toBe(4);
      expect(amount.length).toBe(4);
      expect(status.length).toBe(4);
      expect(iconEye.length).toBe(4);
    });
  });

  describe("When I am on the Bills page and there are bills", () => {
    test("Then the first bill data should contain the correct type, name, date, amount, status, and eye icon", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const bill = screen.getAllByTestId("bill");
      const type = screen.getAllByTestId("type")[0];
      const name = screen.getAllByTestId("name")[0];
      const date = screen.getAllByTestId("date")[0];
      const amount = screen.getAllByTestId("amount")[0];
      const status = screen.getAllByTestId("status")[0];
      const iconEye = screen.getAllByTestId("icon-eye")[0];

      expect(bill.length).toBe(4);
      expect(type.textContent).toBe("Hôtel et logement");
      expect(name.textContent).toBe("encore");
      expect(date.textContent).toBe("2004-04-04");
      expect(amount.textContent).toBe("400 €");
      expect(status.textContent).toBe("pending");
      expect(iconEye.textContent).toBeTruthy();
    });
  });

  describe("When I am on the Bills page and there are 4 bills", () => {
    test("Then the bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I am on the Bills page and there are no bills", () => {
    test("Then no bills should be shown", () => {
      document.body.innerHTML = BillsUI({ data: [] });
      const bill = screen.queryByTestId("bill");
      expect(bill).toBeNull();
    });
  });

  describe("When I am on the Bills page and it is loading", () => {
    test("Then the Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  describe("When I am on the Bills page and the backend sends an error message", () => {
    test("Then the Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});

// Tests pour Bills.js
describe("Given I am connected as Employee and I am on Bill page, there are bills", () => {
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
});
describe("Given I am connected as Employee and I am on Bill page, there are a newBill button", () => {
	describe("When clicking on newBill button", () => {
		test("Then, bill form should open", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			document.body.innerHTML = BillsUI({ data: [] });
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

			const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
			screen.getByTestId("btn-new-bill").addEventListener("click", handleClickNewBill);
			userEvent.click(screen.getByTestId("btn-new-bill"));
			expect(handleClickNewBill).toHaveBeenCalled();
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});
	});
});

