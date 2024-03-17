const url = "http://localhost:5000";

function sendTimeDataToBackend(username, websiteName, timeSpentInSeconds) {
  const data = {
    username: username,
    websiteName: websiteName,
    timeSpentInSeconds: timeSpentInSeconds,
  };

  fetch(`${url}/api/v1/updateData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send time data to backend");
      }
    })
    .catch((error) => {
      console.error("Error sending time data to backend:", error);
    });
}

function displayCategoryMessage(category) {
  const message = category;
  document.getElementById("website_category").innerText = message;
}

function checkWebsiteCategory(username, websiteName) {
  fetch("distracting_websites.json")
    .then((response) => response.json())
    .then((data) => {
      const category = data.includes(websiteName)
        ? "distracting"
        : "non-distracting";
      sendCategoryToBackend(username, websiteName, category);
    })
    .catch((error) => {
      console.error("Error fetching website category:", error);
    });
}

function sendCategoryToBackend(username, websiteName, category) {
  const data = {
    username: username,
    websiteName: websiteName,
    category: category,
  };

  fetch(`${url}/api/v1/category`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send website category to backend");
      }
      return response.json();
    })
    .then((data) => {
      displayCategoryMessage(data.category);
    })
    .catch((error) => {
      console.error("Error sending website category to backend:", error);
    });
}

function updateLoggedInContent() {
  chrome.storage.local.get(
    ["isLoggedIn", "username", "websiteName", "startTime"],
    function (data) {
      const isLoggedIn = data.isLoggedIn;
      if (!isLoggedIn) {
        return;
      }

      const username = data.username;
      const websiteName = data.websiteName;
      const startTime = data.startTime || 0;

      if (!websiteName) {
        document.getElementById("opened_website").innerText =
          "No website is opened";
        document.getElementById("time_spent").innerText = "";
        return;
      }

      document.getElementById("opened_website").innerText =
        "Website Name: " + websiteName;

      const currentTime = Math.round(Date.now() / 1000);
      const timeSpentInSeconds = currentTime - startTime;

      let timeSpent = "";
      if (timeSpentInSeconds >= 60) {
        const minutes = Math.floor(timeSpentInSeconds / 60);
        timeSpent = minutes + " minute" + (minutes !== 1 ? "s" : "");
      } else {
        timeSpent =
          timeSpentInSeconds +
          " second" +
          (timeSpentInSeconds !== 1 ? "s" : "");
      }
      if (timeSpentInSeconds >= 3600) {
        const hours = Math.floor(timeSpentInSeconds / 3600);
        timeSpent = hours + " hour" + (hours !== 1 ? "s" : "");
      }

      document.getElementById("time_spent").innerText =
        "Time Spent: " + timeSpent;

      if (data.startTime && websiteName) {
        sendTimeDataToBackend(username, websiteName, timeSpentInSeconds);
        checkWebsiteCategory(username, websiteName);
      }

      chrome.storage.local.set({ websiteName: websiteName });
    }
  );
}

function updateWebsiteCategory(username, websiteName, isChecked) {
  const category = isChecked ? "non-distracting" : "distracting";
  updateCategory(username, websiteName, category);
}

function updateCategory(username, websiteName, category) {
  const data = {
    username: username,
    websiteName: websiteName,
    category: category,
  };

  fetch(`${url}/api/v1/updateCategory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update website category");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data.category);
    })
    .catch((error) => {
      console.error("Error updating website category:", error);
    });
}

function updateToggle() {
  const displayedCategory =
    document.getElementById("website_category").innerText;
  const categoryToggleState =
    displayedCategory === "distracting" ? false : true;
  categoryToggle.checked = categoryToggleState;
}

document.addEventListener("DOMContentLoaded", async () => {
  updateLoggedInContent();
  updateToggle();
  setInterval(updateLoggedInContent, 1000);
  setInterval(updateToggle, 10);

  const categoryToggle = document.getElementById("categoryToggle");
  categoryToggle.addEventListener("change", async (event) => {
    const isChecked = event.target.checked;
    const { username, websiteName } = await getStoredValues();
    updateWebsiteCategory(username, websiteName, isChecked);
  });
});

async function getStoredValues() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["username", "websiteName"], (data) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(data);
      }
    });
  });
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    updateLoggedInContent();
  }
});
