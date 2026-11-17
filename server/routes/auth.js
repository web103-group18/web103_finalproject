import express from "express"
import passport from "passport"

const router = express.Router()

router.get('/login/success', (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
})
router.get('/login/failed', (req, res) => {
  res.status(401).json({ success: true, message: "failure" })
})
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }

    req.session.destroy((err) => {
      res.clearCookie('connect.sid')
      res.json({ status: "logout", user: {} })
    })
  })
})
router.get(
  '/github',
  passport.authenticate('github', {
    scope: [ 'read:user' ]
  })
)

const CLIENT_URL = process.env.CLIENT_URL || "/";
router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: CLIENT_URL,
    failureRedirect: `${CLIENT_URL}?login=failed`,
  }),
);

export default router