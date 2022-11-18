const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Article = require('../models/article');

router.get('/:id', async (req, res) => {
  const owner = await User.findOne({ steam_id: req.params.id });
  if (!owner) {
    return res.redirect('/');
  }
  const articles = await Article.find({ userId: owner.id });

  if (!req.user) {
    return res.render(("../client/views/profile.ejs"), { user: undefined, auth: undefined, profile_owner: owner, articles: articles });
  }

  if (req.params.id !== req.user.id) {
    return res.render(("../client/views/profile.ejs"), { user: req.user, auth: undefined, profile_owner: owner, articles: articles });
  }



  res.render(("../client/views/profile.ejs"), { user: req.user, auth: true, profile_owner: owner, articles: articles });
});

module.exports = router;