import User from "../model/user.js";

export const updateCategory = async (req, res) => {
  const { username, websiteName, category } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const websiteIndex = user.websites.findIndex(
      (site) => site.domain === websiteName
    );

    if (websiteIndex !== -1) {
      const existingCategory = user.websites[websiteIndex].category;
      return res.status(200).json({ category: existingCategory });
    } else {
      user.websites.push({ domain: websiteName, category });
      await user.save();
      return res.status(200).json({ category });
    }
  } catch (error) {
    console.error("Error updating website category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleWebsiteCategory = async (req, res) => {
  const { username, websiteName } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const websiteIndex = user.websites.findIndex(
      (site) => site.domain === websiteName
    );

    if (websiteIndex !== -1) {
      user.websites[websiteIndex].category =
        user.websites[websiteIndex].category === "distracting"
          ? "non-distracting"
          : "distracting";

      const currentDate = new Date();
      const websiteHistoryIndex = user.websiteHistory.findIndex(
        (entry) => entry.date.toDateString() === currentDate.toDateString()
      );
      if (websiteHistoryIndex !== -1) {
        for (let i = websiteHistoryIndex; i >= 0; i--) {
          const websiteEntryIndex = user.websiteHistory[i].websites.findIndex(
            (website) => website.url === websiteName
          );
          if (websiteEntryIndex !== -1) {
            user.websiteHistory[i].websites[websiteEntryIndex].category =
              user.websites[websiteIndex].category;
          }
        }
      }

      await user.save();

      return res
        .status(200)
        .json({ category: user.websites[websiteIndex].category });
    } else {
      return res
        .status(404)
        .json({ message: "Website not found in user's list" });
    }
  } catch (error) {
    console.error("Error toggling website category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const saveTimeData = async (req, res) => {
  const { username, websiteName, timeSpentInSeconds } = req.body;
  console.log("username", username);
  console.log("websiteName", websiteName);
  console.log("timeSpentInSeconds", timeSpentInSeconds);
  const date = new Date();
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const websiteHistoryEntry = user.websiteHistory.find(
      (entry) => entry.date.toDateString() === new Date(date).toDateString()
    );

    if (websiteHistoryEntry) {
      const websiteEntry = websiteHistoryEntry.websites.find(
        (site) => site.url === websiteName
      );

      if (websiteEntry) {
        const currentTimeSpent = websiteEntry.timeSpentInSeconds;
        if (timeSpentInSeconds - currentTimeSpent < 60) {
          websiteEntry.timeSpentInSeconds = timeSpentInSeconds;
        } else {
          websiteEntry.timeSpentInSeconds += timeSpentInSeconds;
        }
      } else {
        const website = user.websites.find(
          (site) => site.domain === websiteName
        );
        const category = website ? website.category : "non-distracting";
        websiteHistoryEntry.websites.push({
          url: websiteName,
          category: category,
          timeSpentInSeconds: timeSpentInSeconds,
        });
      }
    } else {
      const website = user.websites.find((site) => site.domain === websiteName);
      const category = website ? website.category : "non-distracting";
      user.websiteHistory.push({
        date: date,
        websites: [
          {
            url: websiteName,
            category: category,
            timeSpentInSeconds: timeSpentInSeconds,
          },
        ],
      });
    }
    await user.save();

    return res.status(200).json({ message: "Time data saved successfully" });
  } catch (error) {
    console.log("Error saving time data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWebsiteHistory = async (req, res) => {
  const { username } = req.body;

  try {
      const user = await User.findOne({ username });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const currentDate = new Date();
      const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      const websiteHistory = user.websiteHistory.filter(history => history.date >= sevenDaysAgo);

      return res.status(200).json({ websiteHistory });
  } catch (error) {
      console.error("Error fetching website history:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

