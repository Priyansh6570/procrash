const url = "http://localhost:5000";

async function getStoredValues() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["username"], (data) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    });
  }

  async function fetchUserData(username) {
    const data = {
        username: username
    };

    try {
        const response = await fetch(`${url}/api/v1/userdata`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        return response.json();
    } catch (error) {
        throw error;
    }
}

async function displayUserData() {
    try {
        const { username } = await getStoredValues();
        const userData = await fetchUserData(username);

        const userDataContainer = document.getElementById('userData');
        userDataContainer.innerHTML = '';

        if (userData.websiteHistory && userData.websiteHistory.length > 0) {
            const tableWrapper = document.createElement('div');
            tableWrapper.classList.add('overflow-hidden', 'h-700', 'relative');

            const table = document.createElement('table');
            table.classList.add('w-full', 'border-collapse', 'border', 'border-gray-200');

            const headerRow = document.createElement('tr');
            const headerCell = document.createElement('th');
            headerCell.classList.add('bg-gray-100', 'border', 'px-6', 'py-3', 'text-sm', 'font-semibold', 'text-left');
            headerCell.textContent = 'Procrash Dashboard';
            headerCell.colSpan = userData.websiteHistory.length + 1;
            headerRow.appendChild(headerCell);
            table.appendChild(headerRow);

            const dateRow = document.createElement('tr');

            userData.websiteHistory.forEach(history => {
                const dateCell = document.createElement('th');
                dateCell.classList.add('bg-gray-100', 'border', 'px-6', 'py-3', 'text-sm', 'font-semibold', 'text-left', 'sticky', 'top-0');
                dateCell.textContent = new Date(history.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                dateCell.dataset.columnIndex = dateRow.childElementCount; // Add custom attribute to identify the column index
                dateRow.appendChild(dateCell);
            });
            table.appendChild(dateRow);

            let maxWebsites = 0;
            userData.websiteHistory.forEach(history => {
                maxWebsites = Math.max(maxWebsites, history.websites.length);
            });

            for (let i = 0; i < maxWebsites; i++) {
                const websiteRow = document.createElement('tr');

                userData.websiteHistory.forEach(history => {
                    const websiteCell = document.createElement('td');
                    websiteCell.classList.add('border', 'px-6', 'py-4', 'text-sm', 'text-left', 'align-top');

                    if (history.websites[i]) {
                        const website = history.websites[i];

                        const websiteInfo = document.createElement('div');
                        websiteInfo.classList.add('bg-gray-200', 'p-2', 'rounded', 'flex', 'flex-col', 'gap-2');

                        const websiteName = document.createElement('span');
                        websiteName.textContent = website.url;
                        if (website.category === 'distracting') {
                            websiteName.classList.add('bg-red-500', 'text-white', 'p-2', 'rounded');
                        } else {
                            websiteName.classList.add('bg-green-500', 'text-white', 'p-2', 'rounded');
                        }

                        const timeSpent = document.createElement('span');
                        timeSpent.textContent = `${website.timeSpentInSeconds} seconds`;

                        websiteInfo.appendChild(websiteName);
                        websiteInfo.appendChild(timeSpent);

                        websiteCell.appendChild(websiteInfo);
                    }

                    websiteRow.appendChild(websiteCell);
                });

                table.appendChild(websiteRow);
            }

            tableWrapper.appendChild(table);
            userDataContainer.appendChild(tableWrapper);

            const dateCells = dateRow.querySelectorAll('th');
            dateCells.forEach(cell => {
                cell.addEventListener('mouseenter', () => {
                    const columnIndex = cell.dataset.columnIndex;
                    const wrapper = tableWrapper.parentElement;
                    wrapper.scrollTo({ left: columnIndex * cell.offsetWidth, behavior: 'smooth' });
                });
            });
        } else {
            userDataContainer.textContent = 'No website history found.';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        const userDataContainer = document.getElementById('userData');
        userDataContainer.textContent = 'Failed to fetch user data.';
    }
}

document.addEventListener('DOMContentLoaded', displayUserData());