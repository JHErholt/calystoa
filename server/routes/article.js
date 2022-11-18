const express = require('express');
const router = express.Router();
const got = require('got');
const User = require('../models/user');
const Article = require('../models/article');
require("dotenv").config();






router.get('/create', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/');
    }

    const ownedGamesUri = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${req.user.id}&include_appinfo=true&format=json`
    const ownedGamesResponse = await got(ownedGamesUri);
    const ownedGamesData = JSON.parse(ownedGamesResponse.body);

    res.render(("../client/views/article/create.ejs"), { user: req.user, games: ownedGamesData.response.games });
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.post('/create', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/');
    }

    const user = await User.findOne({ steam_id: req.user.id });
    if (!user) {
      return res.redirect('/');
    }

    if (!req.body.title || !req.body.description || !req.body.game) {
      return res.redirect('/article/create');
    }

    const appId = `${req.body.game}`;

    const appDetailsUri = `http://store.steampowered.com/api/appdetails?appids=${appId}`;
    const appDetailsResponse = await got(appDetailsUri);
    const appDetailsData = JSON.parse(appDetailsResponse.body);

    const ownedGamesUri = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${user.steam_id}&include_appinfo=true&format=json`
    const ownedGamesResponse = await got(ownedGamesUri);
    const ownedGamesData = JSON.parse(ownedGamesResponse.body);

    console.log(ownedGamesData.response.games.find(game => game.appid === parseInt(appId)).playtime_forever);


    const newArticle = new Article({
      userId: user._id,
      appId: appId,
      appName: appDetailsData[appId].data.name,
      title: req.body.title,
      description: req.body.description,
      screenshots: appDetailsData[appId].data.screenshots,
      content: {
        0: {
          class: "container container__width--half container__padding--none",
          columns: {
            0: {
              class: "column column__align--center",
              content: {
                0: {
                  text: req.body.title,
                  tag: "h1",
                  class: "bold"
                },
                1: {
                  text: req.body.description,
                  tag: "p",
                  class: "italic"
                }
              }
            }
          }
        }
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      playtime: (ownedGamesData.response.games.find(game => game.appid === parseInt(appId)).playtime_forever / 60),
    });
    await newArticle.save();
    res.redirect(`/article/${newArticle._id}/edit`);
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/');
    }

    const article = await Article.findOne({ _id: req.params.id });
    if (!article) {
      return res.redirect('/');
    }

    const user = await User.findOne({ steam_id: req.user.id });
    if (!user) {
      return res.redirect('/');
    }

    if (article.userId !== user.id) {
      return res.redirect('/');
    }

    res.render(("../client/views/article/edit.ejs"), { user: req.user, article: article });
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.post('/:id/edit/updates', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/');
    }

    const article = await Article.findOne({ _id: req.params.id });
    if (!article) {
      return res.redirect('/');
    }

    const user = await User.findOne({ steam_id: req.user.id });
    if (!user) {
      return res.redirect('/');
    }

    if (article.userId !== user.id) {
      return res.redirect('/');
    }

    const ownedGamesUri = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${user.steam_id}&include_appinfo=true&format=json`
    const ownedGamesResponse = await got(ownedGamesUri);
    const ownedGamesData = JSON.parse(ownedGamesResponse.body);

    article.content = JSON.parse(req.body.content);
    article.updatedAt = Date.now();
    article.playtime = (ownedGamesData.response.games.find(game => game.appid === parseInt(article.appId)).playtime_forever / 60);
    await article.save();

    res.redirect(`/article/${article.id}`);
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.get('/:id/delete', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/');
    }

    const article = await Article.findOne({ _id: req.params.id });
    if (!article) {
      return res.redirect('/');
    }

    const user = await User.findOne({ steam_id: req.user.id });
    if (!user) {
      return res.redirect('/');
    }

    if (article.userId !== user.id) {
      return res.redirect('/');
    }

    await article.delete();
    res.redirect(`/user/${req.user.id}`);
  }
  catch (err) {
    res.status(400).json(err);
  }
});

router.get('/:id', async (req, res) => {
  const article = await Article.findOne({ _id: req.params.id });
  if (!article) {
    if (!req.user) {
      return res.render(("../client/views/404.ejs"), { user: undefined });
    }
    return res.render(("../client/views/404.ejs"), { user: req.user });
  }

  if (!req.user) {
    return res.render(("../client/views/article/show.ejs"), { user: undefined, article: article });
  }

  res.render(("../client/views/article/show.ejs"), { user: req.user, article: article });
});


module.exports = router;