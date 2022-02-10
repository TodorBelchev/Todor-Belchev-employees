const form = document.getElementById('form');
const csvInput = document.getElementById('form-input-csv');
const section = document.getElementById('data-grid');
const clearBtn = document.getElementById('clear-btn');
const errorMessage = document.querySelector('.error-message');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const input = csvInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const employees = csvToArray(text);
        const longestPair = getHighestPair(employees);

        section.textContent = '';
        const table = el('table', '', 'table')
        const tableHeading = el('thead');
        const tableHeadingRow = el('tr');
        tableHeadingRow.appendChild(el('th', 'Employee ID #1'));
        tableHeadingRow.appendChild(el('th', 'Employee ID #2'));
        tableHeadingRow.appendChild(el('th', 'Project ID'));
        tableHeadingRow.appendChild(el('th', 'Days worked'));
        tableHeading.appendChild(tableHeadingRow);
        table.appendChild(tableHeading);
        Object.values(longestPair).forEach(x => {
            const row = el('tr');
            row.appendChild(el('td', x[1].id1));
            row.appendChild(el('td', x[1].id2));
            row.appendChild(el('td', x[1].pID));
            row.appendChild(el('td', x[1].days));
            table.appendChild(row);
        });
        section.appendChild(table);
    };

    if (input) {
        reader.readAsText(input);
        errorMessage.textContent = '';
    } else {
        errorMessage.textContent = 'Please select file first';
    }
});

clearBtn.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    section.textContent = '';
})

function csvToArray(str, delimiter = ',') {
    const headers = str.slice(0, str.indexOf('\n')).split(delimiter).map(x => x.replaceAll('\"', '').trim());
    const rows = str.slice(str.indexOf('\n') + 1).split('\n');

    const arr = rows.map((row) => {
        const values = row.split(delimiter).map(x => x.replaceAll('\"', '').trim());
        const el = headers.reduce((acc, header, index) => {
            acc[header] = values[index];
            return acc;
        }, {});
        return el;
    });

    return arr;
}

function getHighestPair(employees) {
    const pairs = {};
    const daysTogether = {};
    for (let i = 0; i < employees.length; i++) {
        for (let j = 0; j < employees.length; j++) {
            const firstEmployeeID = employees[i].EmpID;
            const secondEmployeeID = employees[j].EmpID;
            const firstEmployeeProjectID = employees[i].ProjectID;
            const secondEmployeeProjectID = employees[j].ProjectID;
            if (firstEmployeeID == secondEmployeeID) {
                continue;
            }

            if (firstEmployeeProjectID == secondEmployeeProjectID) {
                if (pairs[secondEmployeeID + firstEmployeeID + firstEmployeeProjectID]) {
                    continue;
                }

                const firstEmployeeStartDate = new Date(parseDateString(employees[i].DateFrom));
                const firstEmployeeEndDate = employees[i].DateTo !== "NULL"
                    ? new Date(parseDateString(employees[i].DateTo))
                    : new Date();
                const secondEmployeeStartDate = new Date(parseDateString(employees[j].DateFrom));
                const secondEmployeeEndDate = employees[j].DateTo !== "NULL"
                    ? new Date(parseDateString(employees[j].DateTo))
                    : new Date();

                if (firstEmployeeStartDate > secondEmployeeEndDate || secondEmployeeStartDate > firstEmployeeEndDate) {
                    continue;
                }

                const time = Math.min(firstEmployeeEndDate, secondEmployeeEndDate) - Math.max(firstEmployeeStartDate, secondEmployeeStartDate);
                const days = Math.ceil(time / (1000 * 60 * 60 * 24));

                pairs[firstEmployeeID + secondEmployeeID + firstEmployeeProjectID] = {
                    id1: firstEmployeeID,
                    id2: secondEmployeeID,
                    pID: firstEmployeeProjectID,
                    days: days
                }

                if (daysTogether[firstEmployeeID + secondEmployeeID]) {
                    daysTogether[firstEmployeeID + secondEmployeeID] += days;
                } else {
                    daysTogether[firstEmployeeID + secondEmployeeID] = days;
                }

            }
        }
    }

    const sortedDaysTogether = Object.entries(daysTogether).sort(([k1, v1], [k2, v2]) => v2 - v1);
    return Object.entries(pairs).filter(([k, v]) => k.substring(0, 2) == sortedDaysTogether[0][0]);
}

function el(type, content, className) {
    const result = document.createElement(type);
    result.textContent = content;
    if (className) {
        result.className = className;
    }
    return result;
}

function parseDateString(dateString) {
    const dateParts = dateString.split(new RegExp("[/ -]"));
    const month = dateParts[1];
    const year = dateParts[0].length == 4 ? dateParts[0] : dateParts[2];
    const day = dateParts[0].length == 4 ? dateParts[2] : dateParts[0];
    return `${year}-${month}-${day}`;
}