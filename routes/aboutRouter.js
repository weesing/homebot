import express from "express";

export let router = express.Router();

router.get("/", (req, res, next) => {
  res.jsonp({
    message: `You have reached WeeSing's Raspberry Pi HomeBot NodeJS server.`,
  });
});
