const Favorite = require("../models/favoriteModel");

exports.getYoutubePage = async (req, res) => {
  const q = (req.query.q || "").trim();

  let favorites = [];
  let results = [];
  let apiError = null;

  // מועדפים
  try {
    favorites = await Favorite.listByUser(req.session.user.id);
  } catch (e) {
    apiError = "שגיאה בטעינת מועדפים: " + (e?.message || "");
  }

  // חיפוש ביוטיוב
  if (q) {
    try {
      if (!process.env.YOUTUBE_API_KEY) {
        apiError = "חסר YOUTUBE_API_KEY בקובץ .env";
      } else if (typeof fetch !== "function") {
        apiError = "fetch לא זמין בשרת (Node).";
      } else {
        const url = new URL("https://www.googleapis.com/youtube/v3/search");
        url.searchParams.set("part", "snippet");
        url.searchParams.set("type", "video");
        url.searchParams.set("maxResults", "8");
        url.searchParams.set("q", q);
        url.searchParams.set("key", process.env.YOUTUBE_API_KEY);

        const r = await fetch(url.toString());
        const data = await r.json();

        if (!r.ok || data.error) {
          apiError =
            data?.error?.message ||
            `YouTube API error (status ${r.status})`;
        } else {
          results = (data.items || []).map((it) => ({
            video_id: it.id.videoId,
            title: it.snippet.title,
            thumbnail_url: it.snippet.thumbnails?.medium?.url || "",
            channel_title: it.snippet.channelTitle || "",
          }));
        }
      }
    } catch (e) {
      apiError = "YouTube fetch failed: " + (e?.message || e);
    }
  }

  res.render("youtube", { title: "YouTube", q, results, favorites, apiError });
};

exports.postAddFavorite = async (req, res) => {
  try {
    await Favorite.addFavorite(req.session.user.id, {
      video_id: req.body.video_id,
      title: req.body.title,
      thumbnail_url: req.body.thumbnail_url,
      channel_title: req.body.channel_title,
    });
  } catch (e) {
    // אם יש שגיאת DB, נחזור עם הודעה דרך querystring
    return res.redirect("/youtube?q=" + encodeURIComponent(req.body.q || "") + "&err=1");
  }

  res.redirect("/youtube?q=" + encodeURIComponent(req.body.q || ""));
};

exports.postDeleteFavorite = async (req, res) => {
  try {
    await Favorite.removeFavorite(req.session.user.id, req.body.video_id);
  } catch (e) {
    return res.redirect("/youtube?q=" + encodeURIComponent(req.body.q || "") + "&err=1");
  }
  res.redirect("/youtube?q=" + encodeURIComponent(req.body.q || ""));
};
