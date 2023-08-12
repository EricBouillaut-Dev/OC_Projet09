import VerticalLayout from "./VerticalLayout.js";
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";

import Actions from "./Actions.js";

const row = (bill) => {
	const billDate = bill.formatedDate ?? bill.date;
  
	return `
    <tr data-testid="bill">
      <td data-testid="type">${bill.type}</td>
      <td data-testid="name">${bill.name}</td>
      <td data-testid="date">${billDate}</td>
      <td data-testid="amount">${bill.amount} €</td>
      <td data-testid="status">${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `;
};

// On affichage des notes de frais de facon déçroissante sur les dates (fix) 

const monthToNumber = (abbreviatedMonth) => {
  const monthMap = {
    'Jan.': "1",
    'Fév.': "2",
    'Mar.': "3",
    'Avr.': "4",
    'Mai': "5",
    'Jui.': "6",
    // Pas de conversion possible pour le mois de juillet (Jui.)
    'Aoû.': "8",
    'Sep.': "9",
    'Oct.': "10",
    'Nov.': "11",
    'Déc.': "12"
  };

  return monthMap[abbreviatedMonth];
};

// Formatage des dates
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split(' ');

  // On converti l'année à un format complet (20yy)
  const fullYear = `20${year}`;

  // On converti le mois au format numérique
  const monthNumber = monthToNumber(month);

  return new Date(`${fullYear}-${monthNumber}-${day}`);
};

// Tri décroissant
const rows = (data) => {
  return data && data.length
    ? data
    .sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB - dateA;
    })
    .map((bill) => {
          return row(bill);
        })
        .join("")
    : "";
};


export default ({ data: bills, loading, error }) => {
	const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;

	if (loading) {
		return LoadingPage();
	} else if (error) {
		return ErrorPage(error);
	}

  return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
