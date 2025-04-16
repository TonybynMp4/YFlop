const express = require('express');
const { createRouteHandler } = require('uploadthing/express');
const { uploadRouter } = require('./uploadthing');

const router = express.Router();
router.use('/user', require('./userRouter'));
router.use('/post', require('./postRouter'));
router.use('/comment', require('./commentRouter'));
router.use('/like', require('./likeRouter'));
router.use('/follower', require('./followerRouter'));
router.use('/uploadthing', createRouteHandler({router: uploadRouter}));

module.exports = router;